import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsInt, Min, IsString, IsIn } from "class-validator"
import { Type } from "class-transformer"

export class PaginationDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sort?: string

  @ApiProperty({ required: false, enum: ["asc", "desc"], default: "desc" })
  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  order?: "asc" | "desc" = "desc"

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string
}

