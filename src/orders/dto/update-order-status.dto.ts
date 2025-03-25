import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { OrderStatus } from "../enums/order-status.enum"

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  trackingNumber?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  trackingUrl?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  estimatedDelivery?: string
}

