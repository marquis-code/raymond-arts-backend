import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsObject } from "class-validator"

export class FlutterwaveWebhookDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  data: any
}

