// src/dto/update-commission-request.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { CreateCommissionRequestDto } from './create-commission-request.dto';
import { CommissionStatus } from '../schemas/commission-request.schema';

export class UpdateCommissionRequestDto extends PartialType(CreateCommissionRequestDto) {
  @IsOptional()
  @IsEnum(CommissionStatus)
  status?: CommissionStatus;

  @IsOptional()
  @IsNumber()
  estimatedPrice?: number;

  @IsOptional()
  @IsNumber()
  finalPrice?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}