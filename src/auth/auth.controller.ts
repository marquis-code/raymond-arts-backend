// import { Controller, Post, Body, UseGuards, Request, Get, HttpCode, HttpStatus } from "@nestjs/common"
// import { AuthService } from "./auth.service"
// import { LocalAuthGuard } from "./guards/local-auth.guard"
// import { JwtAuthGuard } from "./guards/jwt-auth.guard"
// import type { CreateUserDto } from "../users/dto/create-user.dto"
// import type { LoginDto } from "./dto/login.dto"
// import type { ResetPasswordDto } from "./dto/reset-password.dto"
// import type { ChangePasswordDto } from "./dto/change-password.dto"
// import type { RequestResetDto } from "./dto/request-reset.dto"
// import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"

// @ApiTags("Auth")
// @Controller("auth")
// export class AuthController {
//   constructor(private authService: AuthService) {}

//   @Post('register')
//   @ApiOperation({ summary: 'Register a new user' })
//   @ApiResponse({ status: 201, description: 'User successfully registered' })
//   @ApiResponse({ status: 400, description: 'Bad request' })
//   async register(@Body() createUserDto: CreateUserDto) {
//     return this.authService.register(createUserDto);
//   }

//   @UseGuards(LocalAuthGuard)
//   @Post("login")
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: "Login a user" })
//   @ApiResponse({ status: 200, description: "User successfully logged in" })
//   @ApiResponse({ status: 401, description: "Unauthorized" })
//   async login(@Request() req, @Body() loginDto: LoginDto) {
//     return this.authService.login(req.user)
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
} from "@nestjs/common"
import { Response } from "express"
import { AuthService } from "./auth.service"
import { LocalAuthGuard } from "./guards/local-auth.guard"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { GoogleAuthGuard, FacebookAuthGuard, AppleAuthGuard } from "./guards/social-auth.guard"
import { CreateUserDto } from "../users/dto/create-user.dto"
import { ResetPasswordDto } from "./dto/reset-password.dto"
import { ChangePasswordDto } from "./dto/change-password.dto"
import { RequestResetDto } from "./dto/request-reset.dto"
import { SocialProvider } from "./dto/social-auth.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

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

  // Google OAuth Routes
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth(@Request() req) {
    // Guard redirects to Google
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Google OAuth callback" })
  async googleAuthRedirect(@Request() req, @Res() res: Response, @Query('redirect') redirect?: string) {
    try {
      const result = await this.authService.socialLogin(req.user)
      const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"

      // Redirect to frontend with token
      res.redirect(`${redirectUrl}/auth/callback?token=${result.accessToken}&provider=google`)
    } catch (error) {
      const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"
      res.redirect(`${redirectUrl}/auth/error?message=${encodeURIComponent(error.message)}`)
    }
  }

  // Facebook OAuth Routes
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Initiate Facebook OAuth login' })
  async facebookAuth(@Request() req) {
    // Guard redirects to Facebook
  }

  @Get("facebook/callback")
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: "Facebook OAuth callback" })
  async facebookAuthRedirect(@Request() req, @Res() res: Response, @Query('redirect') redirect?: string) {
    try {
      const result = await this.authService.socialLogin(req.user)
      const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"

      res.redirect(`${redirectUrl}/auth/callback?token=${result.accessToken}&provider=facebook`)
    } catch (error) {
      const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"
      res.redirect(`${redirectUrl}/auth/error?message=${encodeURIComponent(error.message)}`)
    }
  }

  // Apple OAuth Routes
  @Get('apple')
  @UseGuards(AppleAuthGuard)
  @ApiOperation({ summary: 'Initiate Apple OAuth login' })
  async appleAuth(@Request() req) {
    // Guard redirects to Apple
  }

  @Post("apple/callback")
  @UseGuards(AppleAuthGuard)
  @ApiOperation({ summary: "Apple OAuth callback" })
  async appleAuthRedirect(@Request() req, @Res() res: Response, @Query('redirect') redirect?: string) {
    try {
      const result = await this.authService.socialLogin(req.user)
      const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"

      res.redirect(`${redirectUrl}/auth/callback?token=${result.accessToken}&provider=apple`)
    } catch (error) {
      const redirectUrl = redirect || process.env.FRONTEND_URL || "http://localhost:3000"
      res.redirect(`${redirectUrl}/auth/error?message=${encodeURIComponent(error.message)}`)
    }
  }

  // Unlink social account
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

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('password-reset-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async requestReset(@Body() requestResetDto: RequestResetDto) {
    return this.authService.requestPasswordReset(requestResetDto.email);
  }

  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
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
