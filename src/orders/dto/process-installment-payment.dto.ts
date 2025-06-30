import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNumber, IsString, IsOptional, Min, IsMongoId, IsObject } from 'class-validator'
import { Type } from 'class-transformer'

export class ProcessInstallmentPaymentDto {
  @ApiProperty({ 
    example: "60d21b4667d0d8992e610c85",
    description: "Order ID for installment payment"
  })
  @IsMongoId()
  orderId: string

  @ApiProperty({ 
    example: 50.00,
    description: "Payment amount"
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  paymentAmount: number

  @ApiProperty({ 
    example: "PAY-INST-123456789",
    description: "Payment reference from payment gateway"
  })
  @IsString()
  paymentReference: string

  @ApiPropertyOptional({ 
    example: "credit_card",
    description: "Payment method used"
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string

  @ApiPropertyOptional({ 
    example: "60d21b4667d0d8992e610c85",
    description: "Transaction ID"
  })
  @IsOptional()
  @IsMongoId()
  transactionId?: string

  @ApiPropertyOptional({ 
    description: "Additional payment details"
  })
  @IsOptional()
  @IsObject()
  paymentDetails?: Record<string, any>

  @ApiPropertyOptional({ 
    example: "Installment payment #2 of 6",
    description: "Payment notes"
  })
  @IsOptional()
  @IsString()
  notes?: string
}