import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { 
  IsString, 
  IsArray, 
  IsNumber, 
  ValidateNested, 
  IsOptional, 
  Min, 
  Max,
  IsMongoId,
  ArrayMinSize
} from 'class-validator'
import { Type } from 'class-transformer'
import { CreateOrderItemDto, CreateAddressDto } from './create-order.dto'

export class CreateInstallmentOrderDto {
  @ApiProperty({ 
    type: [CreateOrderItemDto],
    description: "Array of order items"
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[]

  @ApiProperty({ 
    type: CreateAddressDto,
    description: "Shipping address"
  })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  shippingAddress: CreateAddressDto

  @ApiProperty({ 
    type: CreateAddressDto,
    description: "Billing address"
  })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  billingAddress: CreateAddressDto

  @ApiProperty({ 
    example: "60d21b4667d0d8992e610c85",
    description: "Installment plan ID"
  })
  @IsMongoId()
  installmentPlanId: string

  @ApiProperty({ 
    example: 6,
    description: "Number of installments (minimum 2)"
  })
  @IsNumber()
  @Min(2)
  @Type(() => Number)
  numberOfInstallments: number

  @ApiProperty({ 
    example: 100.00,
    description: "Down payment amount"
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  downPayment: number

  @ApiProperty({ 
    example: 50.00,
    description: "Amount per installment"
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  installmentAmount: number

  @ApiPropertyOptional({ 
    example: 5.5,
    description: "Interest rate percentage (0-100)"
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  interestRate?: number

  @ApiProperty({ 
    example: 400.00,
    description: "Total amount payable including interest"
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalPayable: number

  @ApiPropertyOptional({ 
    example: "monthly",
    description: "Payment frequency (weekly, bi-weekly, monthly)"
  })
  @IsOptional()
  @IsString()
  paymentFrequency?: string

  @ApiPropertyOptional({ 
    example: "credit_card",
    description: "Payment method for installments"
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string

  @ApiPropertyOptional({ 
    example: "Please handle with care",
    description: "Additional notes for the order"
  })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiPropertyOptional({ 
    example: 5,
    description: "Order-level discount percentage (0-100)"
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discount?: number

  @ApiPropertyOptional({ 
    example: "standard",
    description: "Shipping method"
  })
  @IsOptional()
  @IsString()
  shippingMethod?: string

  @ApiPropertyOptional({ 
    example: "USD",
    description: "Currency code"
  })
  @IsOptional()
  @IsString()
  currency?: string

  @ApiPropertyOptional({ 
    example: "en-US",
    description: "Locale"
  })
  @IsOptional()
  @IsString()
  locale?: string

  @ApiPropertyOptional({ 
    example: "web",
    description: "Order source (web, mobile, admin)"
  })
  @IsOptional()
  @IsString()
  source?: string
}