import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsOptional, IsString, IsEnum } from "class-validator"

export enum SocialProvider {
  GOOGLE = "google",
  FACEBOOK = "facebook",
  APPLE = "apple",
}

export class SocialAuthDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  firstName?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  picture?: string

  @ApiProperty({ enum: SocialProvider })
  @IsEnum(SocialProvider)
  provider: SocialProvider

  @ApiProperty()
  @IsString()
  providerId: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  accessToken?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  refreshToken?: string
}

export class LinkSocialAccountDto {
  @ApiProperty({ enum: SocialProvider })
  @IsEnum(SocialProvider)
  provider: SocialProvider

  @ApiProperty()
  @IsString()
  providerId: string

  @ApiProperty()
  @IsString()
  accessToken: string
}
