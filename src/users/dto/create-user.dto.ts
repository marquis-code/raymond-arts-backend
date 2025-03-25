import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator"
import { UserRole } from "../enums/user-role.enum"

export class CreateUserDto {
  @ApiProperty({ example: "John" })
  @IsString()
  @IsNotEmpty()
  firstName: string

  @ApiProperty({ example: "Doe" })
  @IsString()
  @IsNotEmpty()
  lastName: string

  @ApiProperty({ example: "john.doe@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ example: "password123" })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.CUSTOMER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.CUSTOMER

  @ApiPropertyOptional({ example: "+1234567890" })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiPropertyOptional({ example: "123 Main St" })
  @IsString()
  @IsOptional()
  address?: string

  @ApiPropertyOptional({ example: "New York" })
  @IsString()
  @IsOptional()
  city?: string

  @ApiPropertyOptional({ example: "NY" })
  @IsString()
  @IsOptional()
  state?: string

  @ApiPropertyOptional({ example: "USA" })
  @IsString()
  @IsOptional()
  country?: string

  @ApiPropertyOptional({ example: "10001" })
  @IsString()
  @IsOptional()
  postalCode?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  profileImage?: string
}

