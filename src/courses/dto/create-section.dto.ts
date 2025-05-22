import { IsString, IsNumber, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

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

  @ApiProperty({ 
    description: 'Course ID this section belongs to',
    example: '60d21b4667d0d8992e610c85'
  })
  @IsMongoId()
  @Transform(({ value }) => value.toString())
  course: string; // Changed from courseId to course
}