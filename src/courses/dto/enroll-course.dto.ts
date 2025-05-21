import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class EnrollCourseDto {
  @ApiProperty({ description: 'Course ID to enroll in' })
  @IsMongoId()
  courseId: Types.ObjectId;
}