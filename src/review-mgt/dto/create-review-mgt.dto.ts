import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewMgtDto {
  @ApiProperty({ description: 'Name of the product being reviewed' })
  @IsNotEmpty()
  @IsString()
  productName: string;

  @ApiProperty({ description: 'Name of the customer writing the review' })
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @ApiProperty({ description: 'Review comment' })
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiProperty({ description: 'Star rating from 1 to 5', minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  starRating: number;
}
