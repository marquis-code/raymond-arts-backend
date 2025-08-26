import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsDateString } from 'class-validator';

export class CreateAnalyticsEventDto {
  @ApiProperty({ example: 'page_view', description: 'Type of analytics event' })
  @IsString()
  eventType: string;

  @ApiProperty({ example: '/home', description: 'Page URL' })
  @IsString()
  page: string;

  @ApiPropertyOptional({ example: 'Home Page', description: 'Page title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'https://google.com', description: 'Referrer URL' })
  @IsString()
  @IsOptional()
  referrer?: string;

  @ApiPropertyOptional({ description: 'User agent string' })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Session identifier' })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'User identifier' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Custom event data' })
  @IsObject()
  @IsOptional()
  customData?: Record<string, any>;
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ example: '2024-01-01', description: 'Start date (ISO string)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'End date (ISO string)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: '/home', description: 'Filter by page' })
  @IsString()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ example: 'page_view', description: 'Filter by event type' })
  @IsString()
  @IsOptional()
  eventType?: string;
}