import { IsString, IsNumber, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateSectionDto {
  @ApiProperty({ description: 'Section title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Section description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Section order in the course' })
  @IsNumber()
  order: number;

  @ApiProperty({ description: 'Course ID this section belongs to' })
  @IsMongoId()
  courseId: Types.ObjectId;
}