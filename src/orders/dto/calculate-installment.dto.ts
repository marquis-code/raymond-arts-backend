import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNumber, Min, Max, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export class CalculateInstallmentDto {
  @ApiProperty({ 
    example: 500.00,
    description: "Total order amount"
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  total: number

  @ApiProperty({ 
    example: 6,
    description: "Number of installments (minimum 2)"
  })
  @IsNumber()
  @Min(2)
  @Type(() => Number)
  numberOfInstallments: number

  @ApiProperty({ 
    example: 20,
    description: "Down payment percentage (0-100)"
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  downPaymentPercentage: number

  @ApiPropertyOptional({ 
    example: 5.5,
    description: "Annual interest rate percentage (0-100)"
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  interestRate?: number
}