// import {
//   Controller,
//   Post,
//   Body,
//   UseGuards,
//   Request,
//   Get,
//   HttpCode,
//   HttpStatus,
//   Res,
//   Query,
//   Delete,
//   Param,
// } from "@nestjs/common"
// import { Response } from "express"
// import { AuthService } from "./auth.service"
// import { LocalAuthGuard } from "./guards/local-auth.guard"
// import { JwtAuthGuard } from "./guards/jwt-auth.guard"
// import { GoogleAuthGuard, FacebookAuthGuard, AppleAuthGuard } from "./guards/social-auth.guard"
// import { CreateUserDto } from "../users/dto/create-user.dto"
// import { ResetPasswordDto } from "./dto/reset-password.dto"
// import { ChangePasswordDto } from "./dto/change-password.dto"
// import { RequestResetDto } from "./dto/request-reset.dto"
// import { SocialProvider } from "./dto/social-auth.dto"
// import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"

// @ApiTags("Auth")
// @Controller("auth")
// export class AuthController {
//   constructor(private authService: AuthService) {}

//   @Post("register")
//   @ApiOperation({ summary: "Register a new user" })
//   @ApiResponse({ status: 201, description: "User successfully registered" })
//   @ApiResponse({ status: 400, description: "Bad request" })
//   async register(createUserDto: CreateUserDto) {
//     return this.authService.register(createUserDto)
//   }

//   @UseGuards(LocalAuthGuard)
//   @Post("login")
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: "Login a user" })
//   @ApiResponse({ status: 200, description: "User successfully logged in" })
//   @ApiResponse({ status: 401, description: "Unauthorized" })
//   async login(@Request() req) {
//     return this.authService.login(req.user)
//   }

//   // Google OAuth Routes
//   @Get('google')
//   @UseGuards(GoogleAuthGuard)
//   @ApiOperation({ summary: 'Initiate Google OAuth login' })
//   async googleAuth(@Request() req) {
//     // Guard redirects to Google
//   }

//   @Get("google/callback")
//   @UseGuards(GoogleAuthGuard)
//   @ApiOperation({ summary: "Google OAuth callback" })
//   async googleAuthRedirect(@Request() req, @Res() res: Response, @Query('redirect') redirect?: string) {
//     try {
//       const result = await this.authService.socialLogin(req.user)
//       const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"

//       // Redirect to frontend with token
//       res.redirect(`${redirectUrl}/auth/callback?token=${result.accessToken}&provider=google`)
//     } catch (error) {
//       const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"
//       res.redirect(`${redirectUrl}/auth/error?message=${encodeURIComponent(error.message)}`)
//     }
//   }

//   // Facebook OAuth Routes
//   @Get('facebook')
//   @UseGuards(FacebookAuthGuard)
//   @ApiOperation({ summary: 'Initiate Facebook OAuth login' })
//   async facebookAuth(@Request() req) {
//     // Guard redirects to Facebook
//   }

//   @Get("facebook/callback")
//   @UseGuards(FacebookAuthGuard)
//   @ApiOperation({ summary: "Facebook OAuth callback" })
//   async facebookAuthRedirect(@Request() req, @Res() res: Response, @Query('redirect') redirect?: string) {
//     try {
//       const result = await this.authService.socialLogin(req.user)
//       const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"

//       res.redirect(`${redirectUrl}/auth/callback?token=${result.accessToken}&provider=facebook`)
//     } catch (error) {
//       const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"
//       res.redirect(`${redirectUrl}/auth/error?message=${encodeURIComponent(error.message)}`)
//     }
//   }

//   // Apple OAuth Routes
//   @Get('apple')
//   @UseGuards(AppleAuthGuard)
//   @ApiOperation({ summary: 'Initiate Apple OAuth login' })
//   async appleAuth(@Request() req) {
//     // Guard redirects to Apple
//   }

//   @Post("apple/callback")
//   @UseGuards(AppleAuthGuard)
//   @ApiOperation({ summary: "Apple OAuth callback" })
//   async appleAuthRedirect(@Request() req, @Res() res: Response, @Query('redirect') redirect?: string) {
//     try {
//       const result = await this.authService.socialLogin(req.user)
//       const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"

//       res.redirect(`${redirectUrl}/auth/callback?token=${result.accessToken}&provider=apple`)
//     } catch (error) {
//       const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"
//       res.redirect(`${redirectUrl}/auth/error?message=${encodeURIComponent(error.message)}`)
//     }
//   }

//   // Unlink social account
//   @UseGuards(JwtAuthGuard)
//   @Delete("social/:provider")
//   @ApiBearerAuth()
//   @ApiOperation({ summary: "Unlink social account" })
//   @ApiResponse({ status: 200, description: "Social account unlinked successfully" })
//   @ApiResponse({ status: 400, description: "Bad request" })
//   @ApiResponse({ status: 401, description: "Unauthorized" })
//   async unlinkSocialAccount(@Request() req, @Param('provider') provider: SocialProvider) {
//     return this.authService.unlinkSocialAccount(req.user.sub, provider)
//   }

//   @UseGuards(JwtAuthGuard)
//   @Get('profile')
//   @ApiBearerAuth()
//   @ApiOperation({ summary: 'Get user profile' })
//   @ApiResponse({ status: 200, description: 'User profile retrieved' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   getProfile(@Request() req) {
//     return req.user;
//   }

//   @Post('password-reset-request')
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: 'Request password reset' })
//   @ApiResponse({ status: 200, description: 'Password reset email sent' })
//   @ApiResponse({ status: 400, description: 'Bad request' })
//   async requestReset(@Body() requestResetDto: RequestResetDto) {
//     return this.authService.requestPasswordReset(requestResetDto.email);
//   }

//   @Post('password-reset')
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: 'Reset password with token' })
//   @ApiResponse({ status: 200, description: 'Password reset successful' })
//   @ApiResponse({ status: 400, description: 'Bad request' })
//   async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
//     return this.authService.resetPassword(
//       resetPasswordDto.token,
//       resetPasswordDto.newPassword,
//     );
//   }

//   @UseGuards(JwtAuthGuard)
//   @Post("change-password")
//   @HttpCode(HttpStatus.OK)
//   @ApiBearerAuth()
//   @ApiOperation({ summary: "Change password" })
//   @ApiResponse({ status: 200, description: "Password changed successfully" })
//   @ApiResponse({ status: 400, description: "Bad request" })
//   @ApiResponse({ status: 401, description: "Unauthorized" })
//   async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
//     return this.authService.changePassword(
//       req.user.sub,
//       changePasswordDto.currentPassword,
//       changePasswordDto.newPassword,
//     )
//   }
// }


// import { Controller, Post, UseGuards, Get, HttpCode, HttpStatus, Delete } from "@nestjs/common"
// import { Response } from "express"
// import { AuthService } from "./auth.service"
// import { UsersService } from "../users/users.service"
// import { AuditService } from "../audit/audit.service"
// import { LocalAuthGuard } from "./guards/local-auth.guard"
// import { JwtAuthGuard } from "./guards/jwt-auth.guard"
// import { GoogleAuthGuard, FacebookAuthGuard, AppleAuthGuard } from "./guards/social-auth.guard"
// import { CreateUserDto } from "../users/dto/create-user.dto"
// import { ResetPasswordDto } from "./dto/reset-password.dto"
// import { ChangePasswordDto } from "./dto/change-password.dto"
// import { RequestResetDto } from "./dto/request-reset.dto"
// import { SocialAuthDto, SocialProvider, SocialUser, OAuthUser, LinkSocialAccountDto } from "./dto/social-auth.dto"
// import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"

// @ApiTags("Authentication")
// @Controller("auth")
// export class AuthController {
//   constructor(
//     private authService: AuthService,
//     private usersService: UsersService,
//     private auditService: AuditService,
//   ) {}

//   // ==================== TRADITIONAL AUTHENTICATION ====================

//   @Post("register")
//   @ApiOperation({ summary: "Register a new user" })
//   @ApiResponse({ status: 201, description: "User successfully registered" })
//   @ApiResponse({ status: 400, description: "Bad request" })
//   async register(createUserDto: CreateUserDto) {
//     return this.authService.register(createUserDto)
//   }

//   @UseGuards(LocalAuthGuard)
//   @Post("login")
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: "Login a user" })
//   @ApiResponse({ status: 200, description: "User successfully logged in" })
//   @ApiResponse({ status: 401, description: "Unauthorized" })
//   async login(req) {
//     return this.authService.login(req.user)
//   }

//   // ==================== OAUTH REDIRECT-BASED SOCIAL AUTH ====================

//   // Google OAuth Routes
//   @Get("google")
//   @UseGuards(GoogleAuthGuard)
//   @ApiOperation({ summary: "Initiate Google OAuth login" })
//   async googleAuth(req) {
//     // Guard redirects to Google
//   }

//   @Get("google/callback")
//   @UseGuards(GoogleAuthGuard)
//   @ApiOperation({ summary: "Google OAuth callback" })
//   async googleAuthRedirect(req, res: Response, redirect?: string) {
//     try {
//       // Transform OAuth user to our SocialUser format
//       const oauthUser: OAuthUser = req.user
//       const socialUser: SocialUser = {
//         email: oauthUser.email,
//         firstName: oauthUser.firstName,
//         lastName: oauthUser.lastName,
//         picture: oauthUser.picture,
//         provider: oauthUser.provider,
//         providerId: oauthUser.id, // Map 'id' to 'providerId'
//         accessToken: oauthUser.accessToken,
//         refreshToken: oauthUser.refreshToken,
//       }

//       const result = await this.authService.socialLogin(socialUser)
//       const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"

//       res.redirect(`${redirectUrl}/auth/callback?token=${result.accessToken}&provider=google`)
//     } catch (error) {
//       const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"
//       res.redirect(`${redirectUrl}/auth/error?message=${encodeURIComponent(error.message)}`)
//     }
//   }

//   // Facebook OAuth Routes
//   @Get("facebook")
//   @UseGuards(FacebookAuthGuard)
//   @ApiOperation({ summary: "Initiate Facebook OAuth login" })
//   async facebookAuth(req) {
//     // Guard redirects to Facebook
//   }

//   @Get("facebook/callback")
//   @UseGuards(FacebookAuthGuard)
//   @ApiOperation({ summary: "Facebook OAuth callback" })
//   async facebookAuthRedirect(req, res: Response, redirect?: string) {
//     try {
//       const oauthUser: OAuthUser = req.user
//       const socialUser: SocialUser = {
//         email: oauthUser.email,
//         firstName: oauthUser.firstName,
//         lastName: oauthUser.lastName,
//         picture: oauthUser.picture,
//         provider: oauthUser.provider,
//         providerId: oauthUser.id,
//         accessToken: oauthUser.accessToken,
//         refreshToken: oauthUser.refreshToken,
//       }

//       const result = await this.authService.socialLogin(socialUser)
//       const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"

//       res.redirect(`${redirectUrl}/auth/callback?token=${result.accessToken}&provider=facebook`)
//     } catch (error) {
//       const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"
//       res.redirect(`${redirectUrl}/auth/error?message=${encodeURIComponent(error.message)}`)
//     }
//   }

//   // Apple OAuth Routes
//   @Get("apple")
//   @UseGuards(AppleAuthGuard)
//   @ApiOperation({ summary: "Initiate Apple OAuth login" })
//   async appleAuth(req) {
//     // Guard redirects to Apple
//   }

//   @Post("apple/callback")
//   @UseGuards(AppleAuthGuard)
//   @ApiOperation({ summary: "Apple OAuth callback" })
//   async appleAuthRedirect(req, res: Response, redirect?: string) {
//     try {
//       const oauthUser: OAuthUser = req.user
//       const socialUser: SocialUser = {
//         email: oauthUser.email,
//         firstName: oauthUser.firstName,
//         lastName: oauthUser.lastName,
//         picture: oauthUser.picture,
//         provider: oauthUser.provider,
//         providerId: oauthUser.id,
//         accessToken: oauthUser.accessToken,
//         refreshToken: oauthUser.refreshToken,
//       }

//       const result = await this.authService.socialLogin(socialUser)
//       const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"

//       res.redirect(`${redirectUrl}/auth/callback?token=${result.accessToken}&provider=apple`)
//     } catch (error) {
//       const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"
//       res.redirect(`${redirectUrl}/auth/error?message=${encodeURIComponent(error.message)}`)
//     }
//   }

//   // ==================== TOKEN-BASED SOCIAL AUTHENTICATION ====================

//   @Post("social-verify")
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: "Verify social authentication token" })
//   @ApiResponse({ status: 200, description: "User authenticated successfully" })
//   @ApiResponse({ status: 400, description: "Bad request" })
//   async socialVerify(socialAuthDto: SocialAuthDto) {
//     // Convert DTO to SocialUser interface
//     const socialUser: SocialUser = {
//       email: socialAuthDto.email,
//       firstName: socialAuthDto.firstName,
//       lastName: socialAuthDto.lastName,
//       picture: socialAuthDto.picture,
//       provider: socialAuthDto.provider,
//       providerId: socialAuthDto.providerId,
//       accessToken: socialAuthDto.accessToken,
//       refreshToken: socialAuthDto.refreshToken,
//     }

//     const user = await this.authService.validateSocialUser(socialUser)
//     return this.authService.socialLogin(user)
//   }

//   @Post("social-signup")
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: "Register a new user with social authentication" })
//   @ApiResponse({ status: 200, description: "User registered successfully" })
//   @ApiResponse({ status: 400, description: "Bad request" })
//   async socialSignup(socialAuthDto: SocialAuthDto) {
//     // Generate a secure random password for social users
//     const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

//     const createUserDto: CreateUserDto & Record<string, any> = {
//       email: socialAuthDto.email,
//       firstName: socialAuthDto.firstName || "",
//       lastName: socialAuthDto.lastName || "",
//       password: password,
//       picture: socialAuthDto.picture,
//       isEmailVerified: true,
//       // Dynamic provider fields
//       [`${socialAuthDto.provider}Id`]: socialAuthDto.providerId,
//       [`${socialAuthDto.provider}AccessToken`]: socialAuthDto.accessToken,
//       [`${socialAuthDto.provider}RefreshToken`]: socialAuthDto.refreshToken,
//     }

//     const user = await this.usersService.create(createUserDto)

//     // Audit log for social registration
//     await this.auditService.createAuditLog({
//       action: "SOCIAL_REGISTER",
//       userId: user.id || user._id?.toString(),
//       module: "AUTH",
//       description: `New user registered via ${socialAuthDto.provider}: ${user.email}`,
//     })

//     // Convert user to SocialUser for socialLogin
//     const socialUser: SocialUser = {
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       picture: user.picture,
//       provider: socialAuthDto.provider,
//       providerId: socialAuthDto.providerId,
//       accessToken: socialAuthDto.accessToken,
//       refreshToken: socialAuthDto.refreshToken,
//     }

//     return this.authService.socialLogin(socialUser)
//   }

//   // ==================== SOCIAL ACCOUNT MANAGEMENT ====================

//   // @UseGuards(JwtAuthGuard)
//   // @Post("social/link")
//   // @ApiBearerAuth()
//   // @ApiOperation({ summary: "Link social account to existing user" })
//   // @ApiResponse({ status: 200, description: "Social account linked successfully" })
//   // @ApiResponse({ status: 400, description: "Bad request" })
//   // @ApiResponse({ status: 401, description: "Unauthorized" })
//   // async linkSocialAccount(req, linkSocialAccountDto: LinkSocialAccountDto) {
//   //   return this.authService.linkSocialAccount(req.user.sub, linkSocialAccountDto)
//   // }

//   @UseGuards(JwtAuthGuard)
//   @Delete("social/:provider")
//   @ApiBearerAuth()
//   @ApiOperation({ summary: "Unlink social account" })
//   @ApiResponse({ status: 200, description: "Social account unlinked successfully" })
//   @ApiResponse({ status: 400, description: "Bad request" })
//   @ApiResponse({ status: 401, description: "Unauthorized" })
//   async unlinkSocialAccount(req, provider: SocialProvider) {
//     return this.authService.unlinkSocialAccount(req.user.sub, provider)
//   }

//   // ==================== USER PROFILE ====================

//   @UseGuards(JwtAuthGuard)
//   @Get("profile")
//   @ApiBearerAuth()
//   @ApiOperation({ summary: "Get user profile" })
//   @ApiResponse({ status: 200, description: "User profile retrieved" })
//   @ApiResponse({ status: 401, description: "Unauthorized" })
//   getProfile(req) {
//     return req.user
//   }

//   // ==================== PASSWORD MANAGEMENT ====================

//   @Post("password-reset-request")
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: "Request password reset" })
//   @ApiResponse({ status: 200, description: "Password reset email sent" })
//   @ApiResponse({ status: 400, description: "Bad request" })
//   async requestReset(requestResetDto: RequestResetDto) {
//     return this.authService.requestPasswordReset(requestResetDto.email)
//   }

//   @Post("password-reset")
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: "Reset password with token" })
//   @ApiResponse({ status: 200, description: "Password reset successful" })
//   @ApiResponse({ status: 400, description: "Bad request" })
//   async resetPassword(resetPasswordDto: ResetPasswordDto) {
//     return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword)
//   }

//   @UseGuards(JwtAuthGuard)
//   @Post("change-password")
//   @HttpCode(HttpStatus.OK)
//   @ApiBearerAuth()
//   @ApiOperation({ summary: "Change password" })
//   @ApiResponse({ status: 200, description: "Password changed successfully" })
//   @ApiResponse({ status: 400, description: "Bad request" })
//   @ApiResponse({ status: 401, description: "Unauthorized" })
//   async changePassword(req, changePasswordDto: ChangePasswordDto) {
//     return this.authService.changePassword(
//       req.user.sub,
//       changePasswordDto.currentPassword,
//       changePasswordDto.newPassword,
//     )
//   }
// }

// import {
//   Controller,
//   Post,
//   Body,
//   UseGuards,
//   Request,
//   Get,
//   HttpCode,
//   HttpStatus,
//   Res,
//   Query,
//   Delete,
//   Param,
// } from "@nestjs/common"
// import { Response } from "express"
// import { AuthService } from "./auth.service"
// import { UsersService } from "../users/users.service"
// import { AuditService } from "../audit/audit.service"
// import { LocalAuthGuard } from "./guards/local-auth.guard"
// import { JwtAuthGuard } from "./guards/jwt-auth.guard"
// import { GoogleAuthGuard, FacebookAuthGuard, AppleAuthGuard } from "./guards/social-auth.guard"
// import { CreateUserDto } from "../users/dto/create-user.dto"
// import { ResetPasswordDto } from "./dto/reset-password.dto"
// import { ChangePasswordDto } from "./dto/change-password.dto"
// import { RequestResetDto } from "./dto/request-reset.dto"
// import { SocialAuthDto, SocialProvider, SocialUser, OAuthUser, LinkSocialAccountDto } from "./dto/social-auth.dto"
// import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
  Res,
  Query,
  Delete,
  Param,
  BadRequestException,
  ConflictException,
} from "@nestjs/common"
import { Response } from "express"
import { AuthService } from "./auth.service"
import { LocalAuthGuard } from "./guards/local-auth.guard"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { GoogleAuthGuard, FacebookAuthGuard, AppleAuthGuard } from "./guards/social-auth.guard"
import { CreateUserDto } from "../users/dto/create-user.dto"
import { ResetPasswordDto } from "./dto/reset-password.dto"
import { ChangePasswordDto } from "./dto/change-password.dto"
import { AuditService } from "../audit/audit.service"
import { UsersService } from "../users/users.service"
import { RequestResetDto } from "./dto/request-reset.dto"
import { SocialAuthDto, SocialProvider, SocialUser, OAuthUser, LinkSocialAccountDto } from "./dto/social-auth.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private auditService: AuditService,
  ) {}

  // ==================== TRADITIONAL AUTHENTICATION ====================

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async register(createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto)
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login a user" })
  @ApiResponse({ status: 200, description: "User successfully logged in" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async login(@Request() req) {
    return this.authService.login(req.user)
  }

  // ==================== OAUTH REDIRECT-BASED SOCIAL AUTH ====================

  // Google OAuth Routes
  @Get("google")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Initiate Google OAuth login" })
  async googleAuth(@Request() req) {
    // Guard redirects to Google
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Google OAuth callback" })
  async googleAuthRedirect(@Request() req, @Res() res: Response, @Query('redirect') redirect?: string) {
    try {
      // Transform OAuth user to our SocialUser format
      const oauthUser: OAuthUser = req.user
      const socialUser: SocialUser = {
        email: oauthUser.email,
        firstName: oauthUser.firstName,
        lastName: oauthUser.lastName,
        picture: oauthUser.picture,
        provider: oauthUser.provider,
        providerId: oauthUser.id, // Map 'id' to 'providerId'
        accessToken: oauthUser.accessToken,
        refreshToken: oauthUser.refreshToken,
      }

      const result = await this.authService.socialLogin(socialUser)
      const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"

      res.redirect(`${redirectUrl}/auth/callback?token=${result.accessToken}&provider=google`)
    } catch (error) {
      const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"
      res.redirect(`${redirectUrl}/auth/error?message=${encodeURIComponent(error.message)}`)
    }
  }

  // Facebook OAuth Routes
  @Get("facebook")
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: "Initiate Facebook OAuth login" })
  async facebookAuth(@Request() req) {
    // Guard redirects to Facebook
  }

  @Get("facebook/callback")
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: "Facebook OAuth callback" })
  async facebookAuthRedirect(@Request() req, @Res() res: Response, @Query('redirect') redirect?: string) {
    try {
      const oauthUser: OAuthUser = req.user
      const socialUser: SocialUser = {
        email: oauthUser.email,
        firstName: oauthUser.firstName,
        lastName: oauthUser.lastName,
        picture: oauthUser.picture,
        provider: oauthUser.provider,
        providerId: oauthUser.id,
        accessToken: oauthUser.accessToken,
        refreshToken: oauthUser.refreshToken,
      }

      const result = await this.authService.socialLogin(socialUser)
      const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"

      res.redirect(`${redirectUrl}/auth/callback?token=${result.accessToken}&provider=facebook`)
    } catch (error) {
      const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"
      res.redirect(`${redirectUrl}/auth/error?message=${encodeURIComponent(error.message)}`)
    }
  }

  // Apple OAuth Routes
  @Get("apple")
  @UseGuards(AppleAuthGuard)
  @ApiOperation({ summary: "Initiate Apple OAuth login" })
  async appleAuth(@Request() req) {
    // Guard redirects to Apple
  }

  @Post("apple/callback")
  @UseGuards(AppleAuthGuard)
  @ApiOperation({ summary: "Apple OAuth callback" })
  async appleAuthRedirect(@Request() req, @Res() res: Response, @Query('redirect') redirect?: string) {
    try {
      const oauthUser: OAuthUser = req.user
      const socialUser: SocialUser = {
        email: oauthUser.email,
        firstName: oauthUser.firstName,
        lastName: oauthUser.lastName,
        picture: oauthUser.picture,
        provider: oauthUser.provider,
        providerId: oauthUser.id,
        accessToken: oauthUser.accessToken,
        refreshToken: oauthUser.refreshToken,
      }

      const result = await this.authService.socialLogin(socialUser)
      const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"

      res.redirect(`${redirectUrl}/auth/callback?token=${result.accessToken}&provider=apple`)
    } catch (error) {
      const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"
      res.redirect(`${redirectUrl}/auth/error?message=${encodeURIComponent(error.message)}`)
    }
  }

  // ==================== TOKEN-BASED SOCIAL AUTHENTICATION ====================

  @Post("social-verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify social authentication token" })
  @ApiResponse({ status: 200, description: "User authenticated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async socialVerify(@Body() socialAuthDto: SocialAuthDto) {
    if (!socialAuthDto) {
      throw new BadRequestException("Social authentication data is required")
    }

    // Validate required fields
    if (!socialAuthDto.email || !socialAuthDto.provider || !socialAuthDto.providerId) {
      throw new BadRequestException("Missing required fields: email, provider, and providerId are required")
    }

    // Convert DTO to SocialUser interface for service
    const socialUser: SocialUser = {
      email: socialAuthDto.email,
      firstName: socialAuthDto.firstName,
      lastName: socialAuthDto.lastName,
      picture: socialAuthDto.picture,
      provider: socialAuthDto.provider,
      providerId: socialAuthDto.providerId,
      accessToken: socialAuthDto.accessToken,
      refreshToken: socialAuthDto.refreshToken,
    }

    const user = await this.authService.validateSocialUser(socialUser)
    return this.authService.socialLogin(user)
  }

  @Post("social-signup")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new user with social authentication" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "User already exists" })
  async socialSignup(@Body() socialAuthDto: SocialAuthDto) {
    if (!socialAuthDto) {
      throw new BadRequestException("Social authentication data is required")
    }

    // Validate required fields
    if (!socialAuthDto.email || !socialAuthDto.provider || !socialAuthDto.providerId) {
      throw new BadRequestException("Missing required fields: email, provider, and providerId are required")
    }

    try {
      // Check if user already exists
      const existingUser = await this.authService.findUserByEmail(socialAuthDto.email)
      if (existingUser) {
        throw new ConflictException("User with this email already exists. Please use social-verify instead.")
      }

      // Generate a secure random password for social users
      const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

      const createUserDto: CreateUserDto & Record<string, any> = {
        email: socialAuthDto.email,
        firstName: socialAuthDto.firstName || "",
        lastName: socialAuthDto.lastName || "",
        password: password,
        picture: socialAuthDto.picture,
        isEmailVerified: true,
        // Dynamic provider fields
        [`${socialAuthDto.provider}Id`]: socialAuthDto.providerId,
        [`${socialAuthDto.provider}AccessToken`]: socialAuthDto.accessToken,
        [`${socialAuthDto.provider}RefreshToken`]: socialAuthDto.refreshToken,
      }

      const user = await this.authService.createUser(createUserDto)

      // Audit log for social registration
      await this.authService.createAuditLog({
        action: "SOCIAL_REGISTER",
        userId: user.id || user._id?.toString(),
        module: "AUTH",
        description: `New user registered via ${socialAuthDto.provider}: ${user.email}`,
      })

      return this.authService.socialLogin(user)
    } catch (error) {
      // Re-throw known HTTP exceptions
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error
      }

      // Handle specific error messages
      if (error.message && error.message.includes("already exists")) {
        throw new ConflictException("User with this email already exists. Please use social-verify instead.")
      }

      // Generic error handling
      throw new BadRequestException(`Social signup failed: ${error.message}`)
    }
  }

  // @Post("social-verify")
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: "Verify social authentication token" })
  // @ApiResponse({ status: 200, description: "User authenticated successfully" })
  // @ApiResponse({ status: 400, description: "Bad request" })
  // async socialVerify(@Body() socialAuthDto: SocialAuthDto) {
  //   try {
  //     // Validate input data
  //     if (!socialAuthDto || !socialAuthDto.email || !socialAuthDto.provider || !socialAuthDto.providerId) {
  //       throw new Error("Missing required social authentication data")
  //     }

  //     // Convert DTO to SocialUser interface
  //     const socialUser: SocialUser = {
  //       email: socialAuthDto.email,
  //       firstName: socialAuthDto.firstName,
  //       lastName: socialAuthDto.lastName,
  //       picture: socialAuthDto.picture,
  //       provider: socialAuthDto.provider,
  //       providerId: socialAuthDto.providerId,
  //       accessToken: socialAuthDto.accessToken,
  //       refreshToken: socialAuthDto.refreshToken,
  //     }

  //     const user = await this.authService.validateSocialUser(socialUser)
  //     return this.authService.socialLogin(user)
  //   } catch (error) {
  //     throw new Error(`Social verification failed: ${error.message}`)
  //   }
  // }

  // @Post("social-signup")
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: "Register a new user with social authentication" })
  // @ApiResponse({ status: 200, description: "User registered successfully" })
  // @ApiResponse({ status: 400, description: "Bad request" })
  // async socialSignup(@Body() socialAuthDto: SocialAuthDto) {
  //   try {
  //     // Validate input data
  //     if (!socialAuthDto || !socialAuthDto.email || !socialAuthDto.provider || !socialAuthDto.providerId) {
  //       throw new Error("Missing required social authentication data")
  //     }

  //     // Generate a secure random password for social users
  //     const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

  //     const createUserDto: CreateUserDto & Record<string, any> = {
  //       email: socialAuthDto.email,
  //       firstName: socialAuthDto.firstName || "",
  //       lastName: socialAuthDto.lastName || "",
  //       password: password,
  //       picture: socialAuthDto.picture,
  //       isEmailVerified: true,
  //       // Dynamic provider fields
  //       [`${socialAuthDto.provider}Id`]: socialAuthDto.providerId,
  //       [`${socialAuthDto.provider}AccessToken`]: socialAuthDto.accessToken,
  //       [`${socialAuthDto.provider}RefreshToken`]: socialAuthDto.refreshToken,
  //     }

  //     const user = await this.usersService.create(createUserDto)

  //     // Audit log for social registration
  //     await this.auditService.createAuditLog({
  //       action: "SOCIAL_REGISTER",
  //       userId: user.id || user._id?.toString(),
  //       module: "AUTH",
  //       description: `New user registered via ${socialAuthDto.provider}: ${user.email}`,
  //     })

  //     // Convert user to SocialUser for socialLogin
  //     const socialUser: SocialUser = {
  //       email: user.email,
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       picture: user.picture,
  //       provider: socialAuthDto.provider,
  //       providerId: socialAuthDto.providerId,
  //       accessToken: socialAuthDto.accessToken,
  //       refreshToken: socialAuthDto.refreshToken,
  //     }

  //     return this.authService.socialLogin(user)
  //   } catch (error) {
  //     throw new Error(`Social signup failed: ${error.message}`)
  //   }
  // }

  // ==================== SOCIAL ACCOUNT MANAGEMENT ====================

  // @UseGuards(JwtAuthGuard)
  // @Post("social/link")
  // @ApiBearerAuth()
  // @ApiOperation({ summary: "Link social account to existing user" })
  // @ApiResponse({ status: 200, description: "Social account linked successfully" })
  // @ApiResponse({ status: 400, description: "Bad request" })
  // @ApiResponse({ status: 401, description: "Unauthorized" })
  // async linkSocialAccount(@Request() req, linkSocialAccountDto: LinkSocialAccountDto) {
  //   return this.authService.linkSocialAccount(req.user.sub, linkSocialAccountDto)
  // }

  @UseGuards(JwtAuthGuard)
  @Delete("social/:provider")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Unlink social account" })
  @ApiResponse({ status: 200, description: "Social account unlinked successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async unlinkSocialAccount(@Request() req, @Param('provider') provider: SocialProvider) {
    return this.authService.unlinkSocialAccount(req.user.sub, provider)
  }

  // ==================== USER PROFILE ====================

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user profile" })
  @ApiResponse({ status: 200, description: "User profile retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getProfile(@Request() req) {
    return req.user
  }

  // ==================== PASSWORD MANAGEMENT ====================

  @Post("password-reset-request")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password reset" })
  @ApiResponse({ status: 200, description: "Password reset email sent" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async requestReset(@Body() requestResetDto: RequestResetDto) {
    return this.authService.requestPasswordReset(requestResetDto.email)
  }

  @Post("password-reset")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password with token" })
  @ApiResponse({ status: 200, description: "Password reset successful" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword)
  }

  @UseGuards(JwtAuthGuard)
  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Change password" })
  @ApiResponse({ status: 200, description: "Password changed successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.sub,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    )
  }
}
