// import { IsString, IsNumber, Min } from "class-validator"

// export class ProcessInstallmentPaymentDto {
//   @IsString()
//   planId: string

//   @IsNumber()
//   @Min(1)
//   installmentNumber: number

//   @IsString()
//   transactionId: string
// }


import { IsNotEmpty, IsString, IsNumber, IsOptional, IsObject } from "class-validator"

export class ProcessInstallmentPaymentDto {
  @IsNotEmpty()
  @IsString()
  planId: string

  @IsNotEmpty()
  @IsNumber()
  installmentNumber: number

  @IsNotEmpty()
  @IsString()
  transactionId: string

  @IsOptional()
  @IsString()
  paymentReference?: string

  @IsOptional()
  @IsString()
  paymentMethod?: string

  @IsOptional()
  @IsObject()
  paymentDetails?: Record<string, any>
}