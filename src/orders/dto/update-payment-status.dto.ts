import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsString, IsNumber, IsObject, Min, IsMongoId } from 'class-validator'
import { Type } from 'class-transformer'
import { PaymentStatus } from '../enums/payment-status.enum'

export class UpdatePaymentStatusDto {
  @ApiProperty({ 
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
    description: "New payment status"
  })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus

  @ApiPropertyOptional({ 
    example: 150.00,
    description: "Payment amount (for partial payments)"
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount?: number

  @ApiPropertyOptional({ 
    example: "60d21b4667d0d8992e610c85",
    description: "Transaction ID"
  })
  @IsOptional()
  @IsMongoId()
  transactionId?: string

  @ApiPropertyOptional({ 
    example: "PAY-123456789",
    description: "Payment reference from payment gateway"
  })
  @IsOptional()
  @IsString()
  paymentReference?: string

  @ApiPropertyOptional({ 
    example: "credit_card",
    description: "Payment method used"
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string

  @ApiPropertyOptional({ 
    description: "Additional payment details from gateway"
  })
  @IsOptional()
  @IsObject()
  paymentDetails?: Record<string, any>

  @ApiPropertyOptional({ 
    example: "Payment processed successfully",
    description: "Additional notes about the payment"
  })
  @IsOptional()
  @IsString()
  notes?: string
}