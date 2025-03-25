import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNotEmpty, IsMongoId, IsNumber, IsOptional, IsString, IsDateString, IsArray, Min } from "class-validator"
import { Type } from "class-transformer"

export class CreateSaleDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  order: string

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  customer: string

  @ApiProperty()
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  products: string[]

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  date?: string

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  transaction?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string
}

