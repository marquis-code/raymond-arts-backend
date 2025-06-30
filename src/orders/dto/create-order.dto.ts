// import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
// import {
//   IsNotEmpty,
//   IsArray,
//   IsMongoId,
//   IsNumber,
//   IsString,
//   IsEmail,
//   IsEnum,
//   IsOptional,
//   ValidateNested,
//   IsObject,
//   Min,
//   ArrayMinSize,
// } from "class-validator"
// import { Type } from "class-transformer"
// import { PaymentType } from "../schemas/order.schema"

// class OrderItemDto {
//   @ApiProperty({ example: "60d21b4667d0d8992e610c85" })
//   @IsMongoId()
//   @IsNotEmpty()
//   product: string

//   @ApiProperty({ example: 2 })
//   @IsNumber()
//   @Min(1)
//   @Type(() => Number)
//   quantity: number
// }



// export class InstallmentDetailsDto {
//   @IsNumber()
//   @Min(2)
//   numberOfInstallments: number

//   @IsNumber()
//   @Min(0)
//   downPaymentPercentage: number

//   @IsString()
//   @IsNotEmpty()
//   paymentFrequency: string

//   @IsString()
//   @IsNotEmpty()
//   paymentMethod: string

//   @IsOptional()
//   @IsString()
//   cardToken?: string

//   @IsOptional()
//   @IsObject()
//   paymentMethodDetails?: Record<string, any>
// }

// class AddressDto {
//   @ApiProperty({ example: "John" })
//   @IsString()
//   @IsNotEmpty()
//   firstName: string

//   @ApiProperty({ example: "Doe" })
//   @IsString()
//   @IsNotEmpty()
//   lastName: string

//   @ApiProperty({ example: "123 Main St" })
//   @IsString()
//   @IsNotEmpty()
//   address: string

//   @ApiProperty({ example: "New York" })
//   @IsString()
//   @IsNotEmpty()
//   city: string

//   @ApiProperty({ example: "NY" })
//   @IsString()
//   @IsNotEmpty()
//   state: string

//   @ApiProperty({ example: "USA" })
//   @IsString()
//   @IsNotEmpty()
//   country: string

//   @ApiProperty({ example: "10001" })
//   @IsString()
//   @IsNotEmpty()
//   postalCode: string

//   @ApiProperty({ example: "+1234567890" })
//   @IsString()
//   @IsNotEmpty()
//   phone: string

//   @ApiProperty({ example: "john.doe@example.com" })
//   @IsEmail()
//   @IsNotEmpty()
//   email: string
// }

// export class CreateOrderDto {
//   @ApiProperty({ type: [OrderItemDto] })
//   @IsArray()
//   @ArrayMinSize(1)
//   @ValidateNested({ each: true })
//   @Type(() => OrderItemDto)
//   items: OrderItemDto[]

//   @ApiProperty({ type: AddressDto })
//   @ValidateNested()
//   @Type(() => AddressDto)
//   shippingAddress: AddressDto

//   @ApiProperty({ type: AddressDto })
//   @ValidateNested()
//   @Type(() => AddressDto)
//   billingAddress: AddressDto

//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   notes?: string

//   @IsOptional()
//   @IsEnum(PaymentType)
//   paymentType?: PaymentType

//   @IsOptional()
//   @ValidateNested()
//   @Type(() => InstallmentDetailsDto)
//   installmentDetails?: InstallmentDetailsDto
// }



import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import {
  IsNotEmpty,
  IsArray,
  IsMongoId,
  IsNumber,
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsObject,
  Min,
  Max,
  ArrayMinSize,
  IsBoolean,
} from "class-validator"
import { Type } from "class-transformer"
import { PaymentType } from "../schemas/order.schema"

export class CreateOrderItemDto {
  @ApiProperty({ 
    example: "60d21b4667d0d8992e610c85",
    description: "Product ID"
  })
  @IsMongoId()
  @IsNotEmpty()
  product: string

  @ApiProperty({ 
    example: 2,
    description: "Quantity of the product"
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number

  @ApiPropertyOptional({ 
    example: "Large",
    description: "Product size"
  })
  @IsString()
  @IsOptional()
  size?: string

  @ApiPropertyOptional({ 
    example: "Red",
    description: "Product color"
  })
  @IsString()
  @IsOptional()
  color?: string

  @ApiPropertyOptional({ 
    example: 10,
    description: "Discount percentage for this item (0-100)"
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  discount?: number
}

export class CreateAddressDto {
  @ApiProperty({ example: "John" })
  @IsString()
  @IsNotEmpty()
  firstName: string

  @ApiProperty({ example: "Doe" })
  @IsString()
  @IsNotEmpty()
  lastName: string

  @ApiProperty({ example: "123 Main St" })
  @IsString()
  @IsNotEmpty()
  address: string

  @ApiProperty({ example: "New York" })
  @IsString()
  @IsNotEmpty()
  city: string

  @ApiProperty({ example: "NY" })
  @IsString()
  @IsNotEmpty()
  state: string

  @ApiProperty({ example: "USA" })
  @IsString()
  @IsNotEmpty()
  country: string

  @ApiProperty({ example: "10001" })
  @IsString()
  @IsNotEmpty()
  postalCode: string

  @ApiProperty({ example: "+1234567890" })
  @IsString()
  @IsNotEmpty()
  phone: string

  @ApiProperty({ example: "john.doe@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string
}

export class CreateInstallmentInfoDto {
  @ApiPropertyOptional({ 
    example: "60d21b4667d0d8992e610c85",
    description: "Installment plan ID"
  })
  @IsOptional()
  @IsMongoId()
  installmentPlan?: string

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
}

export class CreateOrderDto {
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

  @ApiPropertyOptional({ 
    example: "Please handle with care",
    description: "Additional notes for the order"
  })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiPropertyOptional({ 
    enum: PaymentType,
    example: PaymentType.FULL,
    description: "Payment type - full or installment"
  })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType

  @ApiPropertyOptional({ 
    type: CreateInstallmentInfoDto,
    description: "Installment information (required if paymentType is INSTALLMENT)"
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateInstallmentInfoDto)
  installmentInfo?: CreateInstallmentInfoDto

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
    example: "credit_card",
    description: "Payment method"
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string

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

  @ApiPropertyOptional({ 
    description: "Additional metadata"
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}