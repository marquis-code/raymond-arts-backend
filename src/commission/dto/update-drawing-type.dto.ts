// src/dto/update-drawing-type.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateDrawingTypeDto } from './create-drawing-type.dto';

export class UpdateDrawingTypeDto extends PartialType(CreateDrawingTypeDto) {}