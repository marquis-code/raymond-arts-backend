import { IsString, IsArray, IsOptional } from "class-validator"

export class CreateOriginalDto {
  @IsString()
  name: string

  @IsString()
  description: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[]
}
