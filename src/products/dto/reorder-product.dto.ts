import { IsString, IsNumber, IsArray, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"

export class ReorderProductItemDto {
  @ApiProperty({ example: "60d21b4667d0d8992e610c85" })
  @IsString()
  id: string

  @ApiProperty({ example: 0 })
  @IsNumber()
  position: number
}

export class ReorderProductsDto {
  @ApiProperty({ type: [ReorderProductItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderProductItemDto)
  orderedProducts: ReorderProductItemDto[]
}
