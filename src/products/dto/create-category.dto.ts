import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsMongoId, Min } from "class-validator"
import { Type } from "class-transformer"

export class CreateCategoryDto {
  @ApiProperty({ example: "Abstract Art" })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ example: "Collection of abstract artworks" })
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional({ example: "https://example.com/category.jpg" })
  @IsString()
  @IsOptional()
  image?: string

  @ApiPropertyOptional({ example: "60d21b4667d0d8992e610c85" })
  @IsMongoId()
  @IsOptional()
  parent?: string

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  order?: number
}

