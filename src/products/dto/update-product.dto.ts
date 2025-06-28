// import { PartialType } from "@nestjs/swagger"
// import { CreateProductDto } from "./create-product.dto"

// export class UpdateProductDto extends PartialType(CreateProductDto) {}


import { PartialType } from "@nestjs/mapped-types"
import { CreateProductDto } from "./create-product.dto"
import { IsOptional, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class InstallmentConfigDto {
  @IsOptional()
  enabled?: boolean

  @IsOptional()
  maxInstallments?: number

  @IsOptional()
  interestRate?: number

  @IsOptional()
  minimumAmount?: number

  @IsOptional()
  availableTerms?: number[]
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @ValidateNested()
  @Type(() => InstallmentConfigDto)
  installmentConfig?: InstallmentConfigDto
}