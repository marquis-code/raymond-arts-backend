import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { 
  IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, 
  IsArray, Min, IsMongoId, IsEnum, ValidateNested, IsInt, Max 
} from "class-validator"
import { Type } from "class-transformer"

export enum ProductSize {
  SMALL = 'small',
  BASIC = 'basic',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export class SizePriceDto {
  @ApiProperty({ enum: ProductSize, example: ProductSize.MEDIUM })
  @IsEnum(ProductSize)
  @IsNotEmpty()
  size: ProductSize;

  @ApiProperty({ example: 299.99 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;
}

export class ReviewDto {
  @ApiProperty({ example: "60d21b4667d0d8992e610c85" })
  @IsMongoId()
  user: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @ApiProperty({ example: "Great product, highly recommended!" })
  @IsString()
  @IsNotEmpty()
  comment: string;
}

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

  // New fields
  @ApiPropertyOptional({ 
    example: "This product is made with high-quality materials and crafted with attention to detail." 
  })
  @IsString()
  @IsOptional()
  productInfo?: string;

  @ApiPropertyOptional({ 
    example: "Returns accepted within 30 days of purchase. Item must be in original condition." 
  })
  @IsString()
  @IsOptional()
  returnPolicy?: string;

  @ApiPropertyOptional({ 
    example: "Free shipping on orders over $50. Standard delivery takes 3-5 business days." 
  })
  @IsString()
  @IsOptional()
  shippingInfo?: string;

  @ApiPropertyOptional({ 
    type: [SizePriceDto],
    example: [
      { size: ProductSize.SMALL, price: 249.99 },
      { size: ProductSize.MEDIUM, price: 299.99 },
      { size: ProductSize.LARGE, price: 349.99 }
    ] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizePriceDto)
  @IsOptional()
  sizes?: SizePriceDto[];

  @ApiPropertyOptional({ 
    example: "Limited time offer: 20% off until the end of the month!" 
  })
  @IsString()
  @IsOptional()
  promotionText?: string;

  @ApiPropertyOptional({ 
    type: [ReviewDto],
    example: [
      { 
        user: "60d21b4667d0d8992e610c85", 
        rating: 5, 
        comment: "Excellent product! Exactly as described." 
      }
    ] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewDto)
  @IsOptional()
  reviews?: ReviewDto[];
}