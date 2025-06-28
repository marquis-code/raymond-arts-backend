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

export enum ProductColor {
  BLACK = 'black',
  WHITE = 'white'
}

export class InstallmentConfigDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean

  @IsOptional()
  @IsNumber()
  @Min(2)
  maxInstallments?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRate?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumAmount?: number

  @IsOptional()
  @IsArray()
  availableTerms?: number[]
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

  @ApiPropertyOptional({ enum: ProductColor, example: ProductColor.BLACK, default: ProductColor.BLACK })
  @IsEnum(ProductColor)
  @IsOptional()
  color?: ProductColor;

  @IsOptional()
  @ValidateNested()
  @Type(() => InstallmentConfigDto)
  installmentConfig?: InstallmentConfigDto
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

  @ApiPropertyOptional({ example: "2025-06-10T10:30:00.000Z" })
  @IsOptional()
  @IsString()
  createdAt?: string;
}

export class CreateProductDto {
  @ApiProperty({ example: "Premium Wireless Headphones" })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: "High-quality wireless headphones with noise cancellation and premium sound experience." })
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

  @ApiPropertyOptional({ 
    example: [
      "https://example.com/images/headphones-1.jpg",
      "https://example.com/images/headphones-2.jpg"
    ] 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[]

  @ApiPropertyOptional({ example: "67f2a44d26c21f6034c8218d" })
  @IsMongoId()
  @IsOptional()
  category?: string

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean

  @ApiPropertyOptional({ example: 250 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  weight?: number

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  width?: number

  @ApiPropertyOptional({ example: 25 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  height?: number

  @ApiPropertyOptional({ example: 18 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  length?: number

  @ApiPropertyOptional({ example: ["wireless", "bluetooth", "noise-cancelling", "premium", "audio"] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[]

  @ApiPropertyOptional({
    example: {
      "brand": "AudioTech",
      "model": "AT-WH300",
      "batteryLife": "30 hours",
      "chargingTime": "2 hours",
      "bluetoothVersion": "5.0",
      "frequency": "20Hz - 20kHz",
      "impedance": "32 ohms",
      "warranty": "2 years"
    }
  })
  @IsOptional()
  attributes?: Record<string, any>

  @ApiPropertyOptional({ example: ["60d21b4667d0d8992e610c86"] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  relatedProducts?: string[]

  // Add missing tracking fields
  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  viewCount?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  soldCount?: number;

  @ApiPropertyOptional({ example: 0, minimum: 0, maximum: 5 })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  @Type(() => Number)
  rating?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  reviewCount?: number;

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

  @ApiPropertyOptional({ 
    example: "These premium wireless headphones deliver exceptional audio quality with advanced noise cancellation technology. Features include 30-hour battery life, quick charge capability, and comfortable over-ear design suitable for extended use." 
  })
  @IsString()
  @IsOptional()
  productInfo?: string;

  @ApiPropertyOptional({ 
    example: "30-day money-back guarantee. Items must be returned in original condition with all accessories and packaging." 
  })
  @IsString()
  @IsOptional()
  returnPolicy?: string;

  @ApiPropertyOptional({ 
    example: "Free shipping on orders over $100. Standard delivery takes 3-5 business days. Express shipping available for additional cost." 
  })
  @IsString()
  @IsOptional()
  shippingInfo?: string;

  @ApiPropertyOptional({ 
    type: [SizePriceDto],
    example: [
      { size: "small", price: 199.99, color: "black" },
      { size: "basic", price: 249.99, color: "white" },
      { size: "medium", price: 299.99, color: "black" },
      { size: "large", price: 349.99, color: "white" }
    ] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizePriceDto)
  @IsOptional()
  sizes?: SizePriceDto[];

  @ApiPropertyOptional({ 
    example: "Limited Time Offer: Save $50 on Premium Audio Experience!" 
  })
  @IsString()
  @IsOptional()
  promotionText?: string;

  @ApiPropertyOptional({ 
    type: [ReviewDto],
    example: [
      { 
        user: "507f1f77bcf86cd799439014", 
        rating: 5, 
        comment: "Excellent sound quality and comfortable fit. Battery life is impressive!",
        createdAt: "2025-06-10T10:30:00.000Z"
      },
      { 
        user: "507f1f77bcf86cd799439015", 
        rating: 4, 
        comment: "Great headphones overall. Noise cancellation works well in most environments.",
        createdAt: "2025-06-11T14:45:00.000Z"
      }
    ] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewDto)
  @IsOptional()
  reviews?: ReviewDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => InstallmentConfigDto)
  installmentConfig?: InstallmentConfigDto
}