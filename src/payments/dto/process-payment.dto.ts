import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNotEmpty, IsMongoId, IsOptional, IsString } from "class-validator"

export class ProcessPaymentDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  orderId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paymentMethod: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentReference?: string

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>
}

