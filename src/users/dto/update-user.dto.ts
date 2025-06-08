// import { ApiPropertyOptional } from "@nestjs/swagger"
// import { IsEmail, IsEnum, IsOptional, IsString, IsBoolean, MinLength } from "class-validator"
// import { UserRole } from "../enums/user-role.enum"

// export class UpdateUserDto {
//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   firstName?: string

//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   lastName?: string

//   @ApiPropertyOptional()
//   @IsEmail()
//   @IsOptional()
//   email?: string

//   @ApiPropertyOptional({ enum: UserRole })
//   @IsEnum(UserRole)
//   @IsOptional()
//   role?: UserRole

//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   phone?: string

//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   address?: string

//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   city?: string

//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   state?: string

//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   country?: string

//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   postalCode?: string

//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   profileImage?: string

//   @ApiPropertyOptional()
//   @IsBoolean()
//   @IsOptional()
//   isActive?: boolean

//   @ApiPropertyOptional()
//   @IsBoolean()
//   @IsOptional()
//   isEmailVerified?: boolean

//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   resetToken?: string

//   @ApiPropertyOptional()
//   @IsOptional()
//   resetTokenExpiry?: Date

//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   @MinLength(6)
//   password?: string
// }



import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsEmail, IsEnum, IsOptional, IsString, IsBoolean, MinLength } from "class-validator"
import { UserRole } from "../enums/user-role.enum"

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiPropertyOptional({ enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  postalCode?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  profileImage?: string

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  resetToken?: string

  @ApiPropertyOptional()
  @IsOptional()
  resetTokenExpiry?: Date

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string

  // Social Authentication Fields
  @ApiPropertyOptional({ description: "Profile picture URL" })
  @IsString()
  @IsOptional()
  picture?: string

  @ApiPropertyOptional({ description: "Google account ID" })
  @IsString()
  @IsOptional()
  googleId?: string

  @ApiPropertyOptional({ description: "Facebook account ID" })
  @IsString()
  @IsOptional()
  facebookId?: string

  @ApiPropertyOptional({ description: "Apple account ID" })
  @IsString()
  @IsOptional()
  appleId?: string

  @ApiPropertyOptional({ description: "Google access token" })
  @IsString()
  @IsOptional()
  googleAccessToken?: string

  @ApiPropertyOptional({ description: "Google refresh token" })
  @IsString()
  @IsOptional()
  googleRefreshToken?: string

  @ApiPropertyOptional({ description: "Facebook access token" })
  @IsString()
  @IsOptional()
  facebookAccessToken?: string

  @ApiPropertyOptional({ description: "Facebook refresh token" })
  @IsString()
  @IsOptional()
  facebookRefreshToken?: string

  @ApiPropertyOptional({ description: "Apple access token" })
  @IsString()
  @IsOptional()
  appleAccessToken?: string

  @ApiPropertyOptional({ description: "Apple refresh token" })
  @IsString()
  @IsOptional()
  appleRefreshToken?: string

  @ApiPropertyOptional({ description: "Last login timestamp" })
  @IsOptional()
  lastLoginAt?: Date
}
