
// import { IsString, IsNumber, Min, Max, IsOptional, IsMongoId } from "class-validator"
// import { ApiProperty } from "@nestjs/swagger"

// export class CreateReviewDto {
//   @ApiProperty({ description: "Product ID to review" })
//   @IsString()
//   @IsMongoId()
//   productId: string // Keep this for the API interface

//   @ApiProperty({ description: "Review rating", minimum: 1, maximum: 5 })
//   @IsNumber()
//   @Min(1)
//   @Max(5)
//   rating: number

//   @ApiProperty({ description: "Review comment", required: false })
//   @IsOptional()
//   @IsString()
//   comment?: string

//   @ApiProperty({ description: "Review title", required: false })
//   @IsOptional()
//   @IsString()
//   title?: string
// }

import { IsString, IsNumber, Min, Max, IsOptional, IsMongoId, MaxLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateProductReviewDto {
  @ApiProperty({ 
    description: "Product ID to review",
    example: "507f1f77bcf86cd799439011"
  })
  @IsString()
  @IsMongoId({ message: "Invalid product ID format" })
  productId: string

  @ApiProperty({ 
    description: "Review rating", 
    minimum: 1, 
    maximum: 5,
    example: 4
  })
  @IsNumber({}, { message: "Rating must be a number" })
  @Min(1, { message: "Rating must be at least 1" })
  @Max(5, { message: "Rating must be at most 5" })
  rating: number

  @ApiProperty({ 
    description: "Review comment", 
    required: false,
    maxLength: 1000,
    example: "Great product! Really satisfied with the quality."
  })
  @IsOptional()
  @IsString({ message: "Comment must be a string" })
  @MaxLength(1000, { message: "Comment must be at most 1000 characters" })
  comment?: string

  @ApiProperty({ 
    description: "Review title", 
    required: false,
    maxLength: 200,
    example: "Excellent Quality"
  })
  @IsOptional()
  @IsString({ message: "Title must be a string" })
  @MaxLength(200, { message: "Title must be at most 200 characters" })
  title?: string
}