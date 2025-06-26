import { IsString, IsNumber, Min } from "class-validator"

export class ProcessInstallmentPaymentDto {
  @IsString()
  planId: string

  @IsNumber()
  @Min(1)
  installmentNumber: number

  @IsString()
  transactionId: string
}
