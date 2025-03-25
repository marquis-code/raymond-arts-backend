import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsOptional, IsEmail } from "class-validator"

export class UsePaymentLinkDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  linkId: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  customerName?: string

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  customerEmail?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentMethod?: string = "flutterwave"

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>
}

