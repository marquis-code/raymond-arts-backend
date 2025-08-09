
// import {
//   IsString,
//   IsNumber,
//   Min,
//   Max,
//   IsOptional,
//   IsMongoId,
//   MaxLength,
//   IsEmail,
//   IsArray,
//   IsUrl,
//   ArrayMaxSize,
// } from "class-validator"
// import { ApiProperty } from "@nestjs/swagger"

// export class CreateProductReviewDto {
//   @ApiProperty({
//     description: "Product ID to review",
//     example: "507f1f77bcf86cd799439011",
//   })
//   @IsString()
//   @IsMongoId({ message: "Invalid product ID format" })
//   productId: string

//   @ApiProperty({
//     description: "Reviewer's email address",
//     example: "reviewer@example.com",
//   })
//   @IsEmail({}, { message: "Please provide a valid email address" })
//   email: string

//   @ApiProperty({
//     description: "Reviewer's name",
//     required: false,
//     example: "John Doe",
//   })
//   @IsOptional()
//   @IsString({ message: "Name must be a string" })
//   @MaxLength(100, { message: "Name must be at most 100 characters" })
//   userName?: string

//   @ApiProperty({
//     description: "Review rating",
//     minimum: 1,
//     maximum: 5,
//     example: 4,
//   })
//   @IsNumber({}, { message: "Rating must be a number" })
//   @Min(1, { message: "Rating must be at least 1" })
//   @Max(5, { message: "Rating must be at most 5" })
//   rating: number

//   @ApiProperty({
//     description: "Review comment",
//     required: false,
//     maxLength: 1000,
//     example: "Great product! Really satisfied with the quality.",
//   })
//   @IsOptional()
//   @IsString({ message: "Comment must be a string" })
//   @MaxLength(1000, { message: "Comment must be at most 1000 characters" })
//   comment?: string

//   @ApiProperty({
//     description: "Review title",
//     required: false,
//     maxLength: 200,
//     example: "Excellent Quality",
//   })
//   @IsOptional()
//   @IsString({ message: "Title must be a string" })
//   @MaxLength(200, { message: "Title must be at most 200 characters" })
//   title?: string

//   @ApiProperty({
//     description: "Array of image URLs for the review",
//     required: false,
//     type: [String],
//     example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
//   })
//   @IsOptional()
//   @IsArray({ message: "Image URLs must be an array" })
//   @ArrayMaxSize(5, { message: "Maximum 5 images allowed per review" })
//   @IsUrl({}, { each: true, message: "Each image URL must be a valid URL" })
//   imageUrls?: string[]
// }


import {
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsMongoId,
  MaxLength,
  IsEmail,
  IsArray,
  IsUrl,
  ArrayMaxSize,
  ValidateIf, // Import ValidateIf
} from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateProductReviewDto {
  @ApiPropertyOptional({
    description: "Product ID to review (optional if productName is provided)",
    example: "507f1f77bcf86cd799439011",
  })
  @IsOptional()
  @IsMongoId({ message: "Invalid product ID format" })
  @ValidateIf((o) => !o.productName) // Only validate if productName is NOT present
  productId?: string

  @ApiPropertyOptional({
    description: "Custom product name (optional if productId is provided)",
    example: "My Custom Product Name",
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: "Product name must be a string" })
  @MaxLength(200, { message: "Product name must be at most 200 characters" })
  @ValidateIf((o) => !o.productId) // Only validate if productId is NOT present
  productName?: string

  @ApiProperty({
    description: "Reviewer's email address",
    example: "reviewer@example.com",
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string

  @ApiProperty({
    description: "Reviewer's name",
    required: false,
    example: "John Doe",
  })
  @IsOptional()
  @IsString({ message: "Name must be a string" })
  @MaxLength(100, { message: "Name must be at most 100 characters" })
  userName?: string

  @ApiProperty({
    description: "Review rating",
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsNumber({}, { message: "Rating must be a number" })
  @Min(1, { message: "Rating must be at least 1" })
  @Max(5, { message: "Rating must be at most 5" })
  rating: number

  @ApiProperty({
    description: "Review comment",
    required: false,
    maxLength: 1000,
    example: "Great product! Really satisfied with the quality.",
  })
  @IsOptional()
  @IsString({ message: "Comment must be a string" })
  @MaxLength(1000, { message: "Comment must be at most 1000 characters" })
  comment?: string

  @ApiProperty({
    description: "Review title",
    required: false,
    maxLength: 200,
    example: "Excellent Quality",
  })
  @IsOptional()
  @IsString({ message: "Title must be a string" })
  @MaxLength(200, { message: "Title must be at most 200 characters" })
  title?: string

  @ApiProperty({
    description: "Array of image URLs for the review",
    required: false,
    type: [String],
    example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  })
  @IsOptional()
  @IsArray({ message: "Image URLs must be an array" })
  @ArrayMaxSize(5, { message: "Maximum 5 images allowed per review" })
  @IsUrl({}, { each: true, message: "Each image URL must be a valid URL" })
  imageUrls?: string[]
}