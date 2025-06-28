import { IsNotEmpty, IsString, IsOptional, IsObject } from "class-validator"

export class ProcessPaymentDto {
  @IsNotEmpty()
  @IsString()
  paymentId: string

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