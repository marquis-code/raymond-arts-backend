import { IsString, IsNumber, IsUrl, IsDateString, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePromoSaleDto {
  @ApiProperty({ description: 'Title of the promotional sale' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the promotional sale' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Discount percentage (0-100)', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @ApiProperty({ description: 'Image URL for the promo' })
  @IsUrl()
  imageUrl: string;

  @ApiProperty({ description: 'Start date of the promo (ISO string)' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ description: 'End date of the promo (ISO string). If not provided, promo is lifetime' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Whether this is a lifetime promo', default: false })
  @IsOptional()
  @IsBoolean()
  isLifetime?: boolean;

  @ApiPropertyOptional({ description: 'Priority level (higher number = higher priority)', default: 0 })
  @IsOptional()
  @IsNumber()
  priority?: number;
}