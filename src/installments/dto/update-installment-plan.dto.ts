// import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from "class-validator"
// import { InstallmentStatus } from "../schemas/installment-plan.schema"

// export class UpdateInstallmentPlanDto {
//   @IsOptional()
//   @IsEnum(InstallmentStatus)
//   status?: InstallmentStatus

//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   interestRate?: number

//   @IsOptional()
//   @IsString()
//   notes?: string

//   @IsOptional()
//   @IsNumber()
//   @Min(2)
//   @Max(24)
//   numberOfInstallments?: number
// }

import { PartialType } from "@nestjs/mapped-types"
import { CreateInstallmentPlanDto } from "./create-installment-plan.dto"
import { IsOptional, IsEnum } from "class-validator"
import { InstallmentStatus } from "../schemas/installment-plan.schema"

export class UpdateInstallmentPlanDto extends PartialType(CreateInstallmentPlanDto) {
  @IsOptional()
  @IsEnum(InstallmentStatus)
  status?: InstallmentStatus
}