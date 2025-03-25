import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import {
  IsNotEmpty,
  IsArray,
  IsMongoId,
  IsNumber,
  IsString,
  IsEmail,
  IsOptional,
  ValidateNested,
  Min,
  ArrayMinSize,
  IsDateString,
} from "class-validator"
import { Type } from "class-transformer"

class InvoiceItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number
}

class AddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  postalCode: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string
}

export class CreateInvoiceDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  customer: string

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  order?: string

  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[]

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  dueDate: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress: AddressDto
}

