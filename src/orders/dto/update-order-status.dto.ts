// import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
// import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"
// import { OrderStatus } from "../enums/order-status.enum"

// export class UpdateOrderStatusDto {
//   @ApiProperty({ enum: OrderStatus })
//   @IsEnum(OrderStatus)
//   @IsNotEmpty()
//   status: OrderStatus

//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   notes?: string

//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   trackingNumber?: string

//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   trackingUrl?: string

//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   estimatedDelivery?: string
// }



import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString } from "class-validator"
import { OrderStatus } from "../enums/order-status.enum"

export class UpdateOrderStatusDto {
  @ApiProperty({ 
    enum: OrderStatus,
    example: OrderStatus.PROCESSING,
    description: "New order status"
  })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus

  @ApiPropertyOptional({ 
    example: "Order confirmed and being processed",
    description: "Additional notes for status change"
  })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiPropertyOptional({ 
    example: "1Z999AA1234567890",
    description: "Tracking number for shipped orders"
  })
  @IsString()
  @IsOptional()
  trackingNumber?: string

  @ApiPropertyOptional({ 
    example: "https://tracking.example.com/1Z999AA1234567890",
    description: "Tracking URL for shipped orders"
  })
  @IsString()
  @IsOptional()
  trackingUrl?: string

  @ApiPropertyOptional({ 
    example: "2024-01-15T10:00:00Z",
    description: "Estimated delivery date (ISO string)"
  })
  @IsDateString()
  @IsOptional()
  estimatedDelivery?: string
}