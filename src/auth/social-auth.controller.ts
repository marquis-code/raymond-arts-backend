
// import { Controller, Post, HttpCode, HttpStatus } from "@nestjs/common"
// import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"
// import type { AuthService } from "../auth/auth.service"
// import type { SocialAuthDto } from "../auth/dto/social-auth.dto"
// import type { UsersService } from "../users/users.service"
// import type { AuditService } from "../audit/audit.service"

// @ApiTags("Social Auth")
// @Controller("social-auth")
// export class SocialAuthController {
//   constructor(
//     private authService: AuthService,
//     private usersService: UsersService,
//     private auditService: AuditService,
//   ) {}

//   @Post("social-verify")
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: "Verify social authentication token" })
//   @ApiResponse({ status: 200, description: "User authenticated successfully" })
//   @ApiResponse({ status: 400, description: "Bad request" })
//   socialVerify(socialAuthDto: SocialAuthDto) {
//     const user = this.authService.validateSocialUser({
//       email: socialAuthDto.email,
//       provider: socialAuthDto.provider,
//       // Use providerId instead of uid
//       [socialAuthDto.provider + "Id"]: socialAuthDto.providerId,
//       // Use picture instead of photoURL
//       picture: socialAuthDto.picture,
//       accessToken: socialAuthDto.accessToken,
//       refreshToken: socialAuthDto.refreshToken,
//     })

//     return this.authService.socialLogin(user)
//   }

//   @Post("social-signup")
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: "Register a new user with social authentication" })
//   @ApiResponse({ status: 200, description: "User registered successfully" })
//   @ApiResponse({ status: 400, description: "Bad request" })
//   socialSignup(socialAuthDto: SocialAuthDto) {
//     // Create a password if not provided
//     const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

//     const createUserDto = {
//       email: socialAuthDto.email,
//       firstName: socialAuthDto.firstName || "",
//       lastName: socialAuthDto.lastName || "",
//       // Generate a random password for social users
//       password: password,
//       // Use picture instead of photoURL
//       picture: socialAuthDto.picture,
//       isEmailVerified: true,
//       // Use providerId instead of uid
//       [socialAuthDto.provider + "Id"]: socialAuthDto.providerId,
//       [`${socialAuthDto.provider}AccessToken`]: socialAuthDto.accessToken,
//       [`${socialAuthDto.provider}RefreshToken`]: socialAuthDto.refreshToken,
//     }

//     const user = this.usersService.create(createUserDto) as Record<string, any>

//     this.auditService.createAuditLog({
//       action: "SOCIAL_REGISTER",
//       userId: user._id.toString(),
//       module: "AUTH",
//       description: `New user registered via ${socialAuthDto.provider}: ${user.email}`,
//     })

//     return this.authService.socialLogin(user)
//   }
// }
