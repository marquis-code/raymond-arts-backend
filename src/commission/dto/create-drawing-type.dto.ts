// src/dto/create-drawing-type.dto.ts
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateDrawingTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
