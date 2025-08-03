import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, ConflictException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { Types } from 'mongoose';
import * as bcrypt from "bcrypt"
import { User } from "./schemas/user.schema"
import type { CreateUserDto } from "./dto/create-user.dto"
import type { UpdateUserDto } from "./dto/update-user.dto"
import type { PaginationParams, PaginatedResult } from "../common/interfaces/pagination.interface"
import { CloudinaryService } from "../cloudinary/cloudinary.service"
import { AuditService } from "../audit/audit.service"

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private cloudinaryService: CloudinaryService,
    private auditService: AuditService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email }).exec()
    if (existingUser) {
      throw new ConflictException("Email already exists")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    })

    return newUser.save()
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc", search } = params
    const skip = (page - 1) * limit

    // Build query
    let query = {}
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    }

    // Execute query
    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(query).exec(),
    ])

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // async findById(id: string): Promise<User> {
  //   const user = await this.userModel.findById(id).exec()
  //   if (!user) {
  //     throw new NotFoundException(`User with ID ${id} not found`)
  //   }
  //   return user
  // }

  async findById(id: any): Promise<User> {
    try {
      // Handle different input formats
      let validId: string;
      
      // If id is null or undefined, throw error
      if (id === null || id === undefined) {
        throw new BadRequestException('User ID cannot be null or undefined');
      }
      
      // If id is an object (like a full user object or ObjectId)
      if (typeof id === 'object') {
        // If it's a MongoDB ObjectId instance
        if (id instanceof Types.ObjectId) {
          validId = id.toString();
        }
        // If it's a user object with _id
        else if (id._id) {
          validId = id._id.toString();
        }
        // If it has a toString method, try using it
        else if (typeof id.toString === 'function') {
          const str = id.toString();
          // Check if the result looks like an ObjectId
          if (/^[0-9a-fA-F]{24}$/.test(str)) {
            validId = str;
          } else {
            throw new BadRequestException(`Invalid user ID format: ${str}`);
          }
        } else {
          throw new BadRequestException(`Cannot extract ID from object: ${JSON.stringify(id)}`);
        }
      }
      // If id is a string
      else if (typeof id === 'string') {
        // If it's a JSON string, try to parse it
        if (id.includes('{') && id.includes('}')) {
          try {
            const parsed = JSON.parse(id);
            if (parsed._id) {
              validId = parsed._id.toString();
            } else {
              throw new BadRequestException(`Parsed object does not contain _id: ${id}`);
            }
          } catch (e) {
            // If it's not valid JSON but matches ObjectId format, use it directly
            if (/^[0-9a-fA-F]{24}$/.test(id)) {
              validId = id;
            } else {
              throw new BadRequestException(`Invalid user ID format: ${id}`);
            }
          }
        } 
        // If it's a simple string, check if it's a valid ObjectId format
        else if (/^[0-9a-fA-F]{24}$/.test(id)) {
          validId = id;
        } else {
          throw new BadRequestException(`Invalid user ID format: ${id}`);
        }
      } else {
        throw new BadRequestException(`Unsupported ID type: ${typeof id}`);
      }
      
      // Now find the user with the validated ID
      const user = await this.userModel.findById(validId).exec();
      
      if (!user) {
        throw new NotFoundException(`User with ID ${validId} not found`);
      }
      
      return user;
    } catch (error) {
      // Re-throw NestJS exceptions
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      // For Mongoose/MongoDB errors
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid user ID format: ${id}`);
      }
      
      // For other errors
      throw new InternalServerErrorException(`Error finding user: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec()
  }

  async findByResetToken(token: string): Promise<User> {
    return this.userModel.findOne({ resetToken: token }).exec()
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id)

    // Check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userModel
        .findOne({
          email: updateUserDto.email,
          _id: { $ne: id },
        })
        .exec()

      if (existingUser) {
        throw new ConflictException("Email already exists")
      }
    }

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10)
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec()

    await this.auditService.createAuditLog({
      action: "UPDATE",
      userId: id,
      module: "USERS",
      description: `User updated: ${user.email}`,
      changes: JSON.stringify(updateUserDto),
    })

    return updatedUser
  }

  async remove(id: string): Promise<User> {
    const user = await this.findById(id)

    // Instead of deleting, mark as inactive
    user.isActive = false
    await user.save()

    await this.auditService.createAuditLog({
      action: "DELETE",
      userId: id,
      module: "USERS",
      description: `User deactivated: ${user.email}`,
    })

    return user
  }

  async uploadProfileImage(id: string, file: Express.Multer.File): Promise<User> {
    const user = await this.findById(id)

    // Upload image to Cloudinary
    const result = await this.cloudinaryService.uploadFile(file, "users")

    // Update user profile image
    user.profileImage = result.secure_url
    await user.save()

    await this.auditService.createAuditLog({
      action: "UPDATE",
      userId: id,
      module: "USERS",
      description: `Profile image updated for: ${user.email}`,
    })

    return user
  }


  async activateUser(id: string): Promise<User> {
    const user = await this.findById(id)
  
    if (user.isActive) {
      throw new BadRequestException('User is already active')
    }
  
    user.isActive = true
    await user.save()
  
    await this.auditService.createAuditLog({
      action: "ACTIVATE",
      userId: id,
      module: "USERS",
      description: `User activated: ${user.email}`,
    })
  
    return user
  }
  
  async deactivateUser(id: string): Promise<User> {
    const user = await this.findById(id)
  
    if (!user.isActive) {
      throw new BadRequestException('User is already inactive')
    }
  
    user.isActive = false
    await user.save()
  
    await this.auditService.createAuditLog({
      action: "DEACTIVATE",
      userId: id,
      module: "USERS",
      description: `User deactivated: ${user.email}`,
    })
  
    return user
  }
  
}

