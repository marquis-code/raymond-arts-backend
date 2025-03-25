import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, MinLength } from "class-validator"

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string
}

