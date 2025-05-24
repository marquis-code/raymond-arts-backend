// src/schemas/drawing-type.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DrawingTypeDocument = DrawingType & Document;

@Schema({ timestamps: true })
export class DrawingType {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const DrawingTypeSchema = SchemaFactory.createForClass(DrawingType);