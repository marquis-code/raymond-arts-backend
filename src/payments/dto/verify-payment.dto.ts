import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class VerifyPaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reference: string
}

