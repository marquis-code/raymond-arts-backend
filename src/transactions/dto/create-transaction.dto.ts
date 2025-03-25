import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNotEmpty, IsEnum, IsNumber, IsMongoId, IsOptional, IsString, Min } from "class-validator"
import { Type } from "class-transformer"
import { TransactionType } from "../enums/transaction-type.enum"
import { TransactionStatus } from "../enums/transaction-status.enum"

export class CreateTransactionDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  user: string

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number

  @ApiPropertyOptional({ enum: TransactionStatus, default: TransactionStatus.PENDING })
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus = TransactionStatus.PENDING

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  order?: string

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  invoice?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentMethod?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentReference?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency?: string = "USD"

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  gatewayResponse?: string

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  feeCharged?: number
}

