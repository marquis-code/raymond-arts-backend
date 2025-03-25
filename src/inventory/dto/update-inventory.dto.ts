import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsNumber, IsOptional, Min } from "class-validator"
import { Type } from "class-transformer"

export class UpdateInventoryDto {
  @ApiPropertyOptional({ example: 15 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  quantity?: number

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  lowStockThreshold?: number
}

