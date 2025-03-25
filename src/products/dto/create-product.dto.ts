import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min, IsMongoId } from "class-validator"
import { Type } from "class-transformer"

export class CreateProductDto {
  @ApiProperty({ example: "Abstract Painting" })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: "Beautiful abstract painting with vibrant colors" })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({ example: 299.99 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number

  @ApiPropertyOptional({ example: 249.99 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discountPrice?: number

  @ApiPropertyOptional({ example: ["https://example.com/image1.jpg"] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[]

  @ApiPropertyOptional({ example: "60d21b4667d0d8992e610c85" })
  @IsMongoId()
  @IsOptional()
  category?: string

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean

  @ApiPropertyOptional({ example: 2.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  weight?: number

  @ApiPropertyOptional({ example: 30 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  width?: number

  @ApiPropertyOptional({ example: 40 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  height?: number

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  length?: number

  @ApiPropertyOptional({ example: ["abstract", "modern", "colorful"] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  attributes?: Record<string, any>

  @ApiPropertyOptional({ example: ["60d21b4667d0d8992e610c86"] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  relatedProducts?: string[]

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isNew?: boolean

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isBestseller?: boolean
}

