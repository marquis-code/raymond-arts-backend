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
} from "class-validator"
import { Type } from "class-transformer"

class OrderItemDto {
  @ApiProperty({ example: "60d21b4667d0d8992e610c85" })
  @IsMongoId()
  @IsNotEmpty()
  product: string

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number
}

class AddressDto {
  @ApiProperty({ example: "John" })
  @IsString()
  @IsNotEmpty()
  firstName: string

  @ApiProperty({ example: "Doe" })
  @IsString()
  @IsNotEmpty()
  lastName: string

  @ApiProperty({ example: "123 Main St" })
  @IsString()
  @IsNotEmpty()
  address: string

  @ApiProperty({ example: "New York" })
  @IsString()
  @IsNotEmpty()
  city: string

  @ApiProperty({ example: "NY" })
  @IsString()
  @IsNotEmpty()
  state: string

  @ApiProperty({ example: "USA" })
  @IsString()
  @IsNotEmpty()
  country: string

  @ApiProperty({ example: "10001" })
  @IsString()
  @IsNotEmpty()
  postalCode: string

  @ApiProperty({ example: "+1234567890" })
  @IsString()
  @IsNotEmpty()
  phone: string

  @ApiProperty({ example: "john.doe@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[]

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress: AddressDto

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string
}

