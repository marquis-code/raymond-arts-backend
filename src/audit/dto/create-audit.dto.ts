import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateAuditDto {
  @IsNotEmpty()
  @IsString()
  action: string

  @IsNotEmpty()
  userId: string

  @IsNotEmpty()
  @IsString()
  module: string

  @IsNotEmpty()
  @IsString()
  description: string

  @IsOptional()
  @IsString()
  changes?: string

  @IsOptional()
  @IsString()
  ipAddress?: string

  @IsOptional()
  @IsString()
  userAgent?: string
}

