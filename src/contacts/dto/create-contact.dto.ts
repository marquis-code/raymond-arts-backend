import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsEmail, IsOptional, IsArray } from "class-validator"

export class CreateContactDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  company?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  position?: string

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
  notes?: string

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[]
}

