import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsEmail, IsEnum, IsOptional, IsString, IsBoolean } from "class-validator"
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
}

