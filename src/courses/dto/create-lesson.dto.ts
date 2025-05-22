import { IsString, IsNumber, IsOptional, IsMongoId, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

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

  @ApiProperty({ 
    description: 'Course ID this lesson belongs to',
    example: '60d21b4667d0d8992e610c85'
  })
  @IsMongoId()
  @Transform(({ value }) => value.toString())
  course: string; // Changed from courseId to course

  @ApiProperty({ 
    description: 'Section ID this lesson belongs to',
    example: '60d21b4667d0d8992e610c85'
  })
  @IsMongoId()
  @Transform(({ value }) => value.toString())
  section: string; // Changed from sectionId to section

  // Rest of the properties remain the same
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