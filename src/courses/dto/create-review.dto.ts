import { IsString, IsNumber, IsMongoId, Min, Max, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateReviewDto {
  @ApiProperty({ description: 'Course ID to review' })
  @IsMongoId()
  courseId: Types.ObjectId;

  @ApiProperty({ description: 'Rating (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Review comment' })
  @IsString()
  @Length(10, 1000)
  comment: string;
}