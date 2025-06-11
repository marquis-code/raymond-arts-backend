// import { ApiProperty } from "@nestjs/swagger"
// import { IsEmail, IsOptional, IsString, IsEnum } from "class-validator"

// export enum SocialProvider {
//   GOOGLE = "google",
//   FACEBOOK = "facebook",
//   APPLE = "apple",
// }

// export class SocialAuthDto {
//   @ApiProperty()
//   @IsEmail()
//   email: string

//   @ApiProperty()
//   @IsString()
//   @IsOptional()
//   firstName?: string

//   @ApiProperty()
//   @IsString()
//   @IsOptional()
//   lastName?: string

//   @ApiProperty()
//   @IsString()
//   @IsOptional()
//   picture?: string

//   @ApiProperty({ enum: SocialProvider })
//   @IsEnum(SocialProvider)
//   provider: SocialProvider

//   @ApiProperty()
//   @IsString()
//   providerId: string

//   @ApiProperty()
//   @IsString()
//   @IsOptional()
//   accessToken?: string

//   @ApiProperty()
//   @IsString()
//   @IsOptional()
//   refreshToken?: string
// }

// export class LinkSocialAccountDto {
//   @ApiProperty({ enum: SocialProvider })
//   @IsEnum(SocialProvider)
//   provider: SocialProvider

//   @ApiProperty()
//   @IsString()
//   providerId: string

//   @ApiProperty()
//   @IsString()
//   accessToken: string
// }


import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsOptional, IsString, IsEnum } from "class-validator"

export enum SocialProvider {
  GOOGLE = "google",
  FACEBOOK = "facebook",
  APPLE = "apple",
}

export class SocialAuthDto {
  @ApiProperty({ description: "User email from social provider" })
  @IsEmail()
  email: string

  @ApiProperty({ description: "User first name", required: false })
  @IsString()
  @IsOptional()
  firstName?: string

  @ApiProperty({ description: "User last name", required: false })
  @IsString()
  @IsOptional()
  lastName?: string

  @ApiProperty({ description: "User profile picture URL", required: false })
  @IsString()
  @IsOptional()
  picture?: string

  @ApiProperty({ description: "Social provider", enum: SocialProvider })
  @IsEnum(SocialProvider)
  provider: SocialProvider

  @ApiProperty({ description: "Unique provider user ID" })
  @IsString()
  providerId: string

  @ApiProperty({ description: "Provider access token", required: false })
  @IsString()
  @IsOptional()
  accessToken?: string

  @ApiProperty({ description: "Provider refresh token", required: false })
  @IsString()
  @IsOptional()
  refreshToken?: string
}

export class LinkSocialAccountDto {
  @ApiProperty({ description: "Social provider", enum: SocialProvider })
  @IsEnum(SocialProvider)
  provider: SocialProvider

  @ApiProperty({ description: "Unique provider user ID" })
  @IsString()
  providerId: string

  @ApiProperty({ description: "Provider access token" })
  @IsString()
  accessToken: string

  @ApiProperty({ description: "Provider refresh token", required: false })
  @IsString()
  @IsOptional()
  refreshToken?: string
}

// Interface for social user validation
export interface SocialUser {
  email: string
  firstName?: string
  lastName?: string
  picture?: string
  provider: SocialProvider
  providerId: string
  accessToken?: string
  refreshToken?: string
}

// Interface for OAuth callback user (from guards)
export interface OAuthUser {
  email: string
  firstName?: string
  lastName?: string
  picture?: string
  provider: SocialProvider
  id: string // This is what comes from OAuth providers
  accessToken?: string
  refreshToken?: string
}
