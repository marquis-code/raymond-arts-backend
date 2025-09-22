import { IsOptional, IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateImageDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim());
    }
    return value;
  })
  tags?: string[];
}
