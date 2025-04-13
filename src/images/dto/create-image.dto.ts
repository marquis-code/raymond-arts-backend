import { IsOptional, IsString, IsArray } from "class-validator"

export class CreateImageDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[]
}
