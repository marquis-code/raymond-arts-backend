// import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsDateString, Min } from "class-validator"
// import { PaymentStatus } from "../schemas/installment-payment.schema"

// export class CreateInstallmentPaymentDto {
//   @IsNotEmpty()
//   @IsString()
//   installmentPlan: string

//   @IsNotEmpty()
//   @IsString()
//   customer: string

//   @IsNotEmpty()
//   @IsNumber()
//   @Min(1)
//   installmentNumber: number

//   @IsNotEmpty()
//   @IsNumber()
//   @Min(0)
//   amount: number

//   @IsNotEmpty()
//   @IsDateString()
//   dueDate: string

//   @IsOptional()
//   @IsEnum(PaymentStatus)
//   status?: PaymentStatus

//   @IsOptional()
//   @IsString()
//   notes?: string
// }

import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsDateString, IsObject, Min, Max } from "class-validator"
import { PaymentFrequency, PaymentMethod } from "../schemas/installment-plan.schema"

export class CreateInstallmentPlanDto {
  @IsNotEmpty()
  @IsString()
  customer: string

  @IsNotEmpty()
  @IsString()
  order: string

  @IsNotEmpty()
  @IsString()
  product: string

  @IsNotEmpty()
  @IsString()
  productSize: string

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount: number

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  downPayment: number

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  numberOfInstallments: number

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate: number

  @IsNotEmpty()
  @IsEnum(PaymentFrequency)
  paymentFrequency: PaymentFrequency

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod

  @IsNotEmpty()
  @IsDateString()
  startDate: string

  @IsOptional()
  @IsString()
  cardToken?: string

  @IsOptional()
  @IsObject()
  paymentMethodDetails?: Record<string, any>

  @IsOptional()
  @IsString()
  notes?: string
}