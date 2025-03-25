import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsDateString } from "class-validator"

export class AddInteractionDto {
  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  date: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  notes: string
}

