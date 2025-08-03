import { IsString, IsNumber, IsArray, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class ReorderOriginalItemDto {
  @IsString()
  id: string

  @IsNumber()
  position: number
}

export class ReorderOriginalsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderOriginalItemDto)
  orderedOriginals: ReorderOriginalItemDto[]
}
