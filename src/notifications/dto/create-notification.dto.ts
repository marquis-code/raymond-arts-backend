import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsMongoId } from "class-validator"

export class CreateNotificationDto {
  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  user?: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isRead?: boolean = false

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reference?: string

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean = false
}

