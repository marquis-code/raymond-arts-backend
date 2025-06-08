// import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common"
// import { JwtService } from "@nestjs/jwt"
// import * as bcrypt from "bcrypt"
// import { UsersService } from "../users/users.service"
// import { EmailService } from "../email/email.service"
// import { AuditService } from "../audit/audit.service"
// import type { CreateUserDto } from "../users/dto/create-user.dto"
// import { v4 as uuidv4 } from "uuid"

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
//       userId: user._id.toString(), // Convert ObjectId to string
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
//       userId: user._id.toString(), // Convert ObjectId to string
//       module: "AUTH",
//       description: `New user registered: ${user.email}`,
//     })

//     const { password: _, ...result } = user.toObject()
    
//     // Generate JWT token for the newly registered user
//     const payload = {
//       sub: user._id,
//       email: user.email,
//       role: user.role,
//     }

//     // Return both user data and access token, similar to login
//     return {
//       user: result,
//       accessToken: this.jwtService.sign(payload),
//     }
//   }

//   async requestPasswordReset(email: string) {
//     const user = await this.usersService.findByEmail(email)

//     if (!user) {
//       throw new BadRequestException("User not found")
//     }

//     const resetToken = uuidv4()
//     const resetTokenExpiry = new Date()
//     resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1) // Token valid for 1 hour

//     await this.usersService.update(user._id.toString(), { // Convert ObjectId to string
//       resetToken,
//       resetTokenExpiry,
//     })

//     await this.emailService.sendPasswordReset(user, resetToken)

//     await this.auditService.createAuditLog({
//       action: "PASSWORD_RESET_REQUEST",
//       userId: user._id.toString(), // Convert ObjectId to string
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

//     await this.usersService.update(user._id.toString(), { // Convert ObjectId to string
//       password: hashedPassword,
//       resetToken: null,
//       resetTokenExpiry: null,
//     })

//     await this.auditService.createAuditLog({
//       action: "PASSWORD_RESET",
//       userId: user._id.toString(), // Convert ObjectId to string
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
//       userId: user._id.toString(), // Convert ObjectId to string
//       module: "AUTH",
//       description: `Password changed for: ${user.email}`,
//     })

//     return { message: "Password changed successfully" }
//   }
// }


// import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from "@nestjs/common"
// import type { JwtService } from "@nestjs/jwt"
// import * as bcrypt from "bcrypt"
// import type { UsersService } from "../users/users.service"
// import type { EmailService } from "../email/email.service"
// import type { AuditService } from "../audit/audit.service"
// import type { CreateUserDto } from "../users/dto/create-user.dto"
// import type { SocialProvider } from "./dto/social-auth.dto"
// import { v4 as uuidv4 } from "uuid"

// interface SocialUser {
//   email: string
//   firstName?: string
//   lastName?: string
//   picture?: string
//   provider: string
//   googleId?: string
//   facebookId?: string
//   appleId?: string
//   accessToken?: string
//   refreshToken?: string
// }

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

//   async validateSocialUser(socialUser: SocialUser): Promise<any> {
//     try {
//       // Check if user exists by email
//       let user = await this.usersService.findByEmail(socialUser.email)

//       if (user) {
//         // User exists, check if social account is already linked
//         const socialAccountField = this.getSocialAccountField(socialUser.provider)
//         const socialId = this.getSocialId(socialUser)

//         if (!user[socialAccountField]) {
//           // Link social account to existing user
//           await this.usersService.update(user._id.toString(), {
//             [socialAccountField]: socialId,
//             picture: socialUser.picture || user.picture,
//           })

//           await this.auditService.createAuditLog({
//             action: "SOCIAL_ACCOUNT_LINKED",
//             userId: user._id.toString(),
//             module: "AUTH",
//             description: `${socialUser.provider} account linked to existing user: ${user.email}`,
//           })
//         } else if (user[socialAccountField] !== socialId) {
//           // Social account is linked to different account
//           throw new ConflictException(`This ${socialUser.provider} account is already linked to a different user`)
//         }

//         // Update last login and social tokens
//         await this.usersService.update(user._id.toString(), {
//           lastLoginAt: new Date(),
//           [`${socialUser.provider}AccessToken`]: socialUser.accessToken,
//           [`${socialUser.provider}RefreshToken`]: socialUser.refreshToken,
//         })

//         user = await this.usersService.findById(user._id.toString())
//       } else {
//         // Create new user with social account
//         const createUserDto: CreateUserDto = {
//           email: socialUser.email,
//           firstName: socialUser.firstName || "",
//           lastName: socialUser.lastName || "",
//           password: uuidv4(), // Generate random password for social users
//           picture: socialUser.picture,
//           isEmailVerified: true, // Social accounts are pre-verified
//           [this.getSocialAccountField(socialUser.provider)]: this.getSocialId(socialUser),
//           [`${socialUser.provider}AccessToken`]: socialUser.accessToken,
//           [`${socialUser.provider}RefreshToken`]: socialUser.refreshToken,
//           lastLoginAt: new Date(),
//         }

//         user = await this.usersService.create(createUserDto)

//         await this.auditService.createAuditLog({
//           action: "SOCIAL_REGISTER",
//           userId: user._id.toString(),
//           module: "AUTH",
//           description: `New user registered via ${socialUser.provider}: ${user.email}`,
//         })
//       }

//       const { password: _, ...result } = user.toObject()
//       return result
//     } catch (error) {
//       if (error instanceof ConflictException || error instanceof BadRequestException) {
//         throw error
//       }
//       throw new BadRequestException(`Social authentication failed: ${error.message}`)
//     }
//   }

//   private getSocialAccountField(provider: string): string {
//     switch (provider) {
//       case "google":
//         return "googleId"
//       case "facebook":
//         return "facebookId"
//       case "apple":
//         return "appleId"
//       default:
//         throw new BadRequestException(`Unsupported provider: ${provider}`)
//     }
//   }

//   private getSocialId(socialUser: SocialUser): string {
//     return socialUser.googleId || socialUser.facebookId || socialUser.appleId
//   }

//   async socialLogin(user: any) {
//     const payload = {
//       sub: user._id,
//       email: user.email,
//       role: user.role,
//       provider: this.getUserProvider(user),
//     }

//     await this.auditService.createAuditLog({
//       action: "SOCIAL_LOGIN",
//       userId: user._id.toString(),
//       module: "AUTH",
//       description: `User logged in via social auth: ${user.email}`,
//     })

//     return {
//       user,
//       accessToken: this.jwtService.sign(payload),
//     }
//   }

//   private getUserProvider(user: any): string {
//     if (user.googleId) return "google"
//     if (user.facebookId) return "facebook"
//     if (user.appleId) return "apple"
//     return "local"
//   }

//   async unlinkSocialAccount(userId: string, provider: SocialProvider) {
//     const user = await this.usersService.findById(userId)

//     if (!user) {
//       throw new BadRequestException("User not found")
//     }

//     const socialField = this.getSocialAccountField(provider)

//     if (!user[socialField]) {
//       throw new BadRequestException(`${provider} account is not linked`)
//     }

//     // Ensure user has a password or another social account before unlinking
//     const hasPassword = user.password && user.password !== ""
//     const hasOtherSocialAccount =
//       (provider !== "google" && user.googleId) ||
//       (provider !== "facebook" && user.facebookId) ||
//       (provider !== "apple" && user.appleId)

//     if (!hasPassword && !hasOtherSocialAccount) {
//       throw new BadRequestException("Cannot unlink the only authentication method. Please set a password first.")
//     }

//     await this.usersService.update(userId, {
//       [socialField]: null,
//       [`${provider}AccessToken`]: null,
//       [`${provider}RefreshToken`]: null,
//     })

//     await this.auditService.createAuditLog({
//       action: "SOCIAL_ACCOUNT_UNLINKED",
//       userId: userId,
//       module: "AUTH",
//       description: `${provider} account unlinked from user: ${user.email}`,
//     })

//     return { message: `${provider} account unlinked successfully` }
//   }

//   async login(user: any) {
//     const payload = {
//       sub: user._id,
//       email: user.email,
//       role: user.role,
//     }

//     await this.auditService.createAuditLog({
//       action: "LOGIN",
//       userId: user._id.toString(),
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
//       userId: user._id.toString(),
//       module: "AUTH",
//       description: `New user registered: ${user.email}`,
//     })

//     const { password: _, ...result } = user.toObject()

//     const payload = {
//       sub: user._id,
//       email: user.email,
//       role: user.role,
//     }

//     return {
//       user: result,
//       accessToken: this.jwtService.sign(payload),
//     }
//   }

//   async requestPasswordReset(email: string) {
//     const user = await this.usersService.findByEmail(email)

//     if (!user) {
//       throw new BadRequestException("User not found")
//     }

//     const resetToken = uuidv4()
//     const resetTokenExpiry = new Date()
//     resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1)

//     await this.usersService.update(user._id.toString(), {
//       resetToken,
//       resetTokenExpiry,
//     })

//     await this.emailService.sendPasswordReset(user, resetToken)

//     await this.auditService.createAuditLog({
//       action: "PASSWORD_RESET_REQUEST",
//       userId: user._id.toString(),
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

//     await this.usersService.update(user._id.toString(), {
//       password: hashedPassword,
//       resetToken: null,
//       resetTokenExpiry: null,
//     })

//     await this.auditService.createAuditLog({
//       action: "PASSWORD_RESET",
//       userId: user._id.toString(),
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
//       userId: user._id.toString(),
//       module: "AUTH",
//       description: `Password changed for: ${user.email}`,
//     })

//     return { message: "Password changed successfully" }
//   }
// }


import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import { UsersService } from "../users/users.service"
import { EmailService } from "../email/email.service"
import { AuditService } from "../audit/audit.service"
import { CreateUserDto } from "../users/dto/create-user.dto"
import { SocialProvider } from "./dto/social-auth.dto"
import { v4 as uuidv4 } from "uuid"

interface SocialUser {
  email: string
  firstName?: string
  lastName?: string
  picture?: string
  provider: string
  googleId?: string
  facebookId?: string
  appleId?: string
  accessToken?: string
  refreshToken?: string
}

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

  async validateSocialUser(socialUser: SocialUser): Promise<any> {
    try {
      // Check if user exists by email
      let user = await this.usersService.findByEmail(socialUser.email)

      if (user) {
        // User exists, check if social account is already linked
        const socialAccountField = this.getSocialAccountField(socialUser.provider)
        const socialId = this.getSocialId(socialUser)

        if (!user[socialAccountField]) {
          // Link social account to existing user
          const updateData: any = {
            [socialAccountField]: socialId,
            lastLoginAt: new Date(),
          }

          // Update picture if not already set
          if (socialUser.picture && !user.picture) {
            updateData.picture = socialUser.picture
          }

          // Update social tokens
          if (socialUser.accessToken) {
            updateData[`${socialUser.provider}AccessToken`] = socialUser.accessToken
          }
          if (socialUser.refreshToken) {
            updateData[`${socialUser.provider}RefreshToken`] = socialUser.refreshToken
          }

          await this.usersService.update(user._id.toString(), updateData)

          await this.auditService.createAuditLog({
            action: "SOCIAL_ACCOUNT_LINKED",
            userId: user._id.toString(),
            module: "AUTH",
            description: `${socialUser.provider} account linked to existing user: ${user.email}`,
          })
        } else if (user[socialAccountField] !== socialId) {
          // Social account is linked to different account
          throw new ConflictException(`This ${socialUser.provider} account is already linked to a different user`)
        }

        // Update last login and social tokens
        const updateData: any = {
          lastLoginAt: new Date(),
        }

        if (socialUser.accessToken) {
          updateData[`${socialUser.provider}AccessToken`] = socialUser.accessToken
        }
        if (socialUser.refreshToken) {
          updateData[`${socialUser.provider}RefreshToken`] = socialUser.refreshToken
        }

        await this.usersService.update(user._id.toString(), updateData)

        user = await this.usersService.findById(user._id.toString())
      } else {
        // Create new user with social account
        const createUserDto: CreateUserDto = {
          email: socialUser.email,
          firstName: socialUser.firstName || "",
          lastName: socialUser.lastName || "",
          password: uuidv4(), // Generate random password for social users
          picture: socialUser.picture,
          isEmailVerified: true, // Social accounts are pre-verified
          lastLoginAt: new Date(),
        }

        // Add social account fields
        const socialAccountField = this.getSocialAccountField(socialUser.provider)
        createUserDto[socialAccountField] = this.getSocialId(socialUser)

        // Add social tokens
        if (socialUser.accessToken) {
          createUserDto[`${socialUser.provider}AccessToken`] = socialUser.accessToken
        }
        if (socialUser.refreshToken) {
          createUserDto[`${socialUser.provider}RefreshToken`] = socialUser.refreshToken
        }

        user = await this.usersService.create(createUserDto)

        await this.auditService.createAuditLog({
          action: "SOCIAL_REGISTER",
          userId: user._id.toString(),
          module: "AUTH",
          description: `New user registered via ${socialUser.provider}: ${user.email}`,
        })
      }

      const { password: _, ...result } = user.toObject()
      return result
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException(`Social authentication failed: ${error.message}`)
    }
  }

  private getSocialAccountField(provider: string): string {
    switch (provider) {
      case "google":
        return "googleId"
      case "facebook":
        return "facebookId"
      case "apple":
        return "appleId"
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`)
    }
  }

  private getSocialId(socialUser: SocialUser): string {
    return socialUser.googleId || socialUser.facebookId || socialUser.appleId || ""
  }

  async socialLogin(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      provider: this.getUserProvider(user),
    }

    await this.auditService.createAuditLog({
      action: "SOCIAL_LOGIN",
      userId: user._id.toString(),
      module: "AUTH",
      description: `User logged in via social auth: ${user.email}`,
    })

    return {
      user,
      accessToken: this.jwtService.sign(payload),
    }
  }

  private getUserProvider(user: any): string {
    if (user.googleId) return "google"
    if (user.facebookId) return "facebook"
    if (user.appleId) return "apple"
    return "local"
  }

  async unlinkSocialAccount(userId: string, provider: SocialProvider) {
    const user = await this.usersService.findById(userId)

    if (!user) {
      throw new BadRequestException("User not found")
    }

    const socialField = this.getSocialAccountField(provider)

    if (!user[socialField]) {
      throw new BadRequestException(`${provider} account is not linked`)
    }

    // Ensure user has a password or another social account before unlinking
    const hasPassword = user.password && user.password !== ""
    const hasOtherSocialAccount =
      (provider !== "google" && user.googleId) ||
      (provider !== "facebook" && user.facebookId) ||
      (provider !== "apple" && user.appleId)

    if (!hasPassword && !hasOtherSocialAccount) {
      throw new BadRequestException("Cannot unlink the only authentication method. Please set a password first.")
    }

    const updateData: any = {
      [socialField]: null,
      [`${provider}AccessToken`]: null,
      [`${provider}RefreshToken`]: null,
    }

    await this.usersService.update(userId, updateData)

    await this.auditService.createAuditLog({
      action: "SOCIAL_ACCOUNT_UNLINKED",
      userId: userId,
      module: "AUTH",
      description: `${provider} account unlinked from user: ${user.email}`,
    })

    return { message: `${provider} account unlinked successfully` }
  }

  async login(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    }

    await this.auditService.createAuditLog({
      action: "LOGIN",
      userId: user._id.toString(),
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
      userId: user._id.toString(),
      module: "AUTH",
      description: `New user registered: ${user.email}`,
    })

    const { password: _, ...result } = user.toObject()

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    }

    return {
      user: result,
      accessToken: this.jwtService.sign(payload),
    }
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email)

    if (!user) {
      throw new BadRequestException("User not found")
    }

    const resetToken = uuidv4()
    const resetTokenExpiry = new Date()
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1)

    await this.usersService.update(user._id.toString(), {
      resetToken,
      resetTokenExpiry,
    })

    await this.emailService.sendPasswordReset(user, resetToken)

    await this.auditService.createAuditLog({
      action: "PASSWORD_RESET_REQUEST",
      userId: user._id.toString(),
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

    await this.usersService.update(user._id.toString(), {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    })

    await this.auditService.createAuditLog({
      action: "PASSWORD_RESET",
      userId: user._id.toString(),
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
      userId: user._id.toString(),
      module: "AUTH",
      description: `Password changed for: ${user.email}`,
    })

    return { message: "Password changed successfully" }
  }
}
