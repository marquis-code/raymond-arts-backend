import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"
import { Type } from "class-transformer"

export class InventoryHistoryDto {
  @ApiProperty({ example: "ADD" })
  @IsString()
  @IsNotEmpty()
  action: string

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Type(() => Number)
  quantity: number

  @ApiProperty({ example: "Initial stock" })
  @IsString()
  @IsNotEmpty()
  notes: string
}

