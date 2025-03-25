import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean, Min, IsDateString } from "class-validator"
import { Type } from "class-transformer"

export class CreatePaymentLinkDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency?: string = "USD"

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expiresAt?: string

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  usageLimit?: number = 0

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isReusable?: boolean = false

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>
}

