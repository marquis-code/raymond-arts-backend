// import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common"
// import type { JwtService } from "@nestjs/jwt"
// import * as bcrypt from "bcrypt"
// import type { UsersService } from "../users/users.service"
// import type { EmailService } from "../email/email.service"
// import type { AuditService } from "../audit/audit.service"
// import type { CreateUserDto } from "../users/dto/create-user.dto"
// import { v4 as uuidv4 } from "uuid"
// import { toObjectId } from '../common/utils/mongoose.util';

// @Injectable()
// export class AuthService {
//   constructor(
//     private usersService: UsersService,
//     private jwtService: JwtService,
//     private emailService: EmailService,
//     private auditService: AuditService,
//   ) {}

//   async validateUser(email: string, password: string): Promise<any> {
//     const user = await this.usersService.findByEmail(email)

//     if (!user) {
//       throw new UnauthorizedException("Invalid credentials")
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password)

//     if (!isPasswordValid) {
//       throw new UnauthorizedException("Invalid credentials")
//     }

//     const { password: _, ...result } = user.toObject()
//     return result
//   }

//   async login(user: any) {
//     const payload = {
//       sub: user._id,
//       email: user.email,
//       role: user.role,
//     }

//     await this.auditService.createAuditLog({
//       action: "LOGIN",
//       userId: toObjectId(user._id.toString()),
//       module: "AUTH",
//       description: `User logged in: ${user.email}`,
//     })

//     return {
//       user,
//       accessToken: this.jwtService.sign(payload),
//     }
//   }

//   async register(createUserDto: CreateUserDto) {
//     const user = await this.usersService.create(createUserDto)

//     await this.auditService.createAuditLog({
//       action: "REGISTER",
//       userId: toObjectId(user._id.toString()),
//       module: "AUTH",
//       description: `New user registered: ${user.email}`,
//     })

//     const { password: _, ...result } = user.toObject()

//     return result
//   }

//   async requestPasswordReset(email: string) {
//     const user = await this.usersService.findByEmail(email)

//     if (!user) {
//       throw new BadRequestException("User not found")
//     }

//     const resetToken = uuidv4()
//     const resetTokenExpiry = new Date()
//     resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1) // Token valid for 1 hour

//     await this.usersService.update(user._id, {
//       resetToken,
//       resetTokenExpiry,
//     })

//     await this.emailService.sendPasswordReset(user, resetToken)

//     await this.auditService.createAuditLog({
//       action: "PASSWORD_RESET_REQUEST",
//       userId: toObjectId(user._id.toString()),
//       module: "AUTH",
//       description: `Password reset requested for: ${user.email}`,
//     })

//     return { message: "Password reset email sent" }
//   }

//   async resetPassword(token: string, newPassword: string) {
//     const user = await this.usersService.findByResetToken(token)

//     if (!user) {
//       throw new BadRequestException("Invalid or expired token")
//     }

//     if (user.resetTokenExpiry < new Date()) {
//       throw new BadRequestException("Reset token has expired")
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10)

//     await this.usersService.update(user._id, {
//       password: hashedPassword,
//       resetToken: null,
//       resetTokenExpiry: null,
//     })

//     await this.auditService.createAuditLog({
//       action: "PASSWORD_RESET",
//       userId: toObjectId(user._id.toString()),
//       module: "AUTH",
//       description: `Password reset completed for: ${user.email}`,
//     })

//     return { message: "Password reset successful" }
//   }

//   async changePassword(userId: string, currentPassword: string, newPassword: string) {
//     const user = await this.usersService.findById(userId)

//     if (!user) {
//       throw new BadRequestException("User not found")
//     }

//     const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

//     if (!isPasswordValid) {
//       throw new UnauthorizedException("Current password is incorrect")
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10)

//     await this.usersService.update(userId, {
//       password: hashedPassword,
//     })

//     await this.auditService.createAuditLog({
//       action: "PASSWORD_CHANGE",
//       userId: toObjectId(user._id.toString()),
//       module: "AUTH",
//       description: `Password changed for: ${user.email}`,
//     })

//     return { message: "Password changed successfully" }
//   }
// }



import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import { UsersService } from "../users/users.service"
import { EmailService } from "../email/email.service"
import { AuditService } from "../audit/audit.service"
import type { CreateUserDto } from "../users/dto/create-user.dto"
import { v4 as uuidv4 } from "uuid"

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email)

    if (!user) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const { password: _, ...result } = user.toObject()
    return result
  }

  async login(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    }

    await this.auditService.createAuditLog({
      action: "LOGIN",
      userId: user._id.toString(), // Convert ObjectId to string
      module: "AUTH",
      description: `User logged in: ${user.email}`,
    })

    return {
      user,
      accessToken: this.jwtService.sign(payload),
    }
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto)

    await this.auditService.createAuditLog({
      action: "REGISTER",
      userId: user._id.toString(), // Convert ObjectId to string
      module: "AUTH",
      description: `New user registered: ${user.email}`,
    })

    const { password: _, ...result } = user.toObject()

    return result
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email)

    if (!user) {
      throw new BadRequestException("User not found")
    }

    const resetToken = uuidv4()
    const resetTokenExpiry = new Date()
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1) // Token valid for 1 hour

    await this.usersService.update(user._id.toString(), { // Convert ObjectId to string
      resetToken,
      resetTokenExpiry,
    })

    await this.emailService.sendPasswordReset(user, resetToken)

    await this.auditService.createAuditLog({
      action: "PASSWORD_RESET_REQUEST",
      userId: user._id.toString(), // Convert ObjectId to string
      module: "AUTH",
      description: `Password reset requested for: ${user.email}`,
    })

    return { message: "Password reset email sent" }
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token)

    if (!user) {
      throw new BadRequestException("Invalid or expired token")
    }

    if (user.resetTokenExpiry < new Date()) {
      throw new BadRequestException("Reset token has expired")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await this.usersService.update(user._id.toString(), { // Convert ObjectId to string
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    })

    await this.auditService.createAuditLog({
      action: "PASSWORD_RESET",
      userId: user._id.toString(), // Convert ObjectId to string
      module: "AUTH",
      description: `Password reset completed for: ${user.email}`,
    })

    return { message: "Password reset successful" }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId)

    if (!user) {
      throw new BadRequestException("User not found")
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await this.usersService.update(userId, {
      password: hashedPassword,
    })

    await this.auditService.createAuditLog({
      action: "PASSWORD_CHANGE",
      userId: user._id.toString(), // Convert ObjectId to string
      module: "AUTH",
      description: `Password changed for: ${user.email}`,
    })

    return { message: "Password changed successfully" }
  }
}