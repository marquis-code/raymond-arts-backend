import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreateTaxConfigDto {
  @ApiProperty({ example: 'US' })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({ example: 'United States' })
  @IsString()
  @IsNotEmpty()
  countryName: string;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  vatRate: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}