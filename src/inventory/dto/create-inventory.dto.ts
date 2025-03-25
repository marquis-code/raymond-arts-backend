import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsMongoId, IsOptional, Min } from "class-validator"
import { Type } from "class-transformer"

export class CreateInventoryDto {
  @ApiProperty({ example: "60d21b4667d0d8992e610c85" })
  @IsMongoId()
  @IsNotEmpty()
  product: string

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  quantity?: number = 0

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  lowStockThreshold?: number = 5
}

