import { IsString, IsNumber, IsOptional, IsDateString, Min, Max } from "class-validator"
import { Type, Transform } from "class-transformer"

export class CreateInstallmentPlanDto {
  @IsString()
  orderId: string

  @IsNumber()
  @Min(2)
  @Max(24)
  numberOfInstallments: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  downPayment?: number

  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  startDate?: Date
}
