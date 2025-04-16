import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreateShippingConfigDto {
  @ApiProperty({ example: 'US' })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({ example: 'United States' })
  @IsString()
  @IsNotEmpty()
  countryName: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  shippingRate: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}