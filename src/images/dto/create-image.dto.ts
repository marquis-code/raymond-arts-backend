// import { IsOptional, IsString } from "class-validator"
// import { Transform } from "class-transformer"

// export class CreateImageDto {
//   @IsOptional()
//   @IsString()
//   name?: string

//   @IsOptional()
//   @IsString()
//   description?: string

//   @IsOptional()
//   @IsString()
//   @Transform(({ value }) => {
//     // Handle both comma-separated strings and JSON arrays from form data
//     if (typeof value === 'string') {
//       try {
//         // Try to parse as JSON first
//         const parsed = JSON.parse(value);
//         if (Array.isArray(parsed)) {
//           return parsed;
//         }
//       } catch {
//         // If JSON parsing fails, split by comma
//         return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
//       }
//     }
//     return value;
//   })
//   tags?: string | string[] // Accept both string and array
// }

import { IsOptional, IsString, IsArray } from "class-validator";
import { Transform } from "class-transformer";

export class CreateImageDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    // Handle form data string conversion to array
    if (typeof value === 'string') {
      try {
        // Try to parse as JSON array first
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.filter(tag => typeof tag === 'string' && tag.trim().length > 0);
        }
      } catch {
        // If JSON parsing fails, split by comma and clean up
        return value
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
      }
    }
    
    // If already an array, filter and clean
    if (Array.isArray(value)) {
      return value
        .filter(tag => typeof tag === 'string')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }
    
    return [];
  })
  tags?: string[];
}