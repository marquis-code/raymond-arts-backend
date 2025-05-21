import { IsString, IsNumber, IsOptional, IsMongoId, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateLessonDto {
  @ApiProperty({ description: 'Lesson title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Lesson description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Lesson order in the section' })
  @IsNumber()
  order: number;

  @ApiProperty({ description: 'Section ID this lesson belongs to' })
  @IsMongoId()
  sectionId: Types.ObjectId;

  @ApiProperty({ description: 'Course ID this lesson belongs to' })
  @IsMongoId()
  courseId: Types.ObjectId;

  @ApiProperty({ 
    description: 'Lesson type', 
    enum: ['video', 'article', 'quiz'], 
    default: 'video' 
  })
  @IsEnum(['video', 'article', 'quiz'])
  @IsOptional()
  type?: string;

  @ApiProperty({ description: 'Video URL for video lessons', required: false })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ description: 'Content for article lessons', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'Lesson duration in minutes', required: false })
  @IsNumber()
  @IsOptional()
  durationInMinutes?: number;

  @ApiProperty({ description: 'Is this a preview lesson?', default: false })
  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;
}