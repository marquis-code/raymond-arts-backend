import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import * as bcrypt from "bcrypt"
import { User } from "./schemas/user.schema"
import type { CreateUserDto } from "./dto/create-user.dto"
import type { UpdateUserDto } from "./dto/update-user.dto"
import type { PaginationParams, PaginatedResult } from "../common/interfaces/pagination.interface"
import type { CloudinaryService } from "../cloudinary/cloudinary.service"
import type { AuditService } from "../audit/audit.service"
import type { Express } from "express"

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

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec()
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return user
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
}

