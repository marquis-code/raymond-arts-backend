// dto/approve-review.dto.ts
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { ProductReviewStatus } from "../review.schema"

export class ApproveReviewDto {
  @ApiProperty({ description: "Review status", enum: ProductReviewStatus })
  @IsEnum(ProductReviewStatus, { message: "Invalid review status" })
  status: ProductReviewStatus

  @ApiProperty({ description: "Reason for rejection", required: false })
  @IsOptional()
  @IsString({ message: "Rejection reason must be a string" })
  @MaxLength(500, { message: "Rejection reason must be at most 500 characters" })
  rejectionReason?: string
}