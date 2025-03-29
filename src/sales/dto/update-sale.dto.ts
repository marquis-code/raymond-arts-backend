// import { PartialType } from "@nestjs/swagger"
// import { CreateSaleDto } from "./create-sale.dto"

// export class UpdateSaleDto extends PartialType(CreateSaleDto) {}

import { PartialType } from "@nestjs/swagger"
import { CreateSaleDto } from "./create-sale.dto"
import { IsDateString, IsOptional } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class UpdateSaleDto extends PartialType(CreateSaleDto) {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  date?: string
}

