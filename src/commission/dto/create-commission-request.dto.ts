// src/dto/create-commission-request.dto.ts
import { IsString, IsEmail, IsOptional, IsDateString, IsMongoId, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCommissionRequestDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  subject: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsMongoId()
  drawingType: string;

  @IsString()
  mainPhoto: string;

  @IsOptional()
  @IsString()
  optionalPhoto1: string;

  @IsOptional()
  @IsString()
  optionalPhoto2: string;
}