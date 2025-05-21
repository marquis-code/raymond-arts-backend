import { IsString, IsNumber, IsOptional, IsArray, IsEnum, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ description: 'Course title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Course description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Detailed course description', required: false })
  @IsString()
  @IsOptional()
  longDescription?: string;

  @ApiProperty({ description: 'Course price', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Discounted price', required: false, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPrice?: number;

  @ApiProperty({ description: 'Course thumbnail URL', required: false })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({ description: 'Preview video URL', required: false })
  @IsString()
  @IsOptional()
  previewVideo?: string;

  @ApiProperty({ description: 'Course tags', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ 
    description: 'Course status', 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  })
  @IsEnum(['draft', 'published', 'archived'])
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Course requirements', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requirements?: string[];

  @ApiProperty({ description: 'Course learning objectives', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  objectives?: string[];

  @ApiProperty({ 
    description: 'Course difficulty level', 
    enum: ['beginner', 'intermediate', 'advanced'], 
    default: 'beginner' 
  })
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  @IsOptional()
  level?: string;

  @ApiProperty({ description: 'Featured course status', default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}