// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
// import type { Document } from "mongoose"

// export type ImageDocument = Image & Document

// @Schema({ timestamps: true })
// export class Image {
//   @Prop({ required: false })
//   name: string

//   @Prop({ required: true })
//   url: string

//   @Prop({ required: true })
//   publicId: string

//   @Prop()
//   description: string

//   @Prop()
//   tags: string[]

//   @Prop()
//   size: number

//   @Prop()
//   format: string

//   @Prop()
//   width: number

//   @Prop()
//   height: number
// }

// export const ImageSchema = SchemaFactory.createForClass(Image)


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImageDocument = Image & Document;

@Schema({
  timestamps: true, // Automatically adds createdAt and updatedAt fields
})
export class Image {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true, unique: true })
  publicId: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true })
  size: number; // File size in bytes

  @Prop({ required: true, default: 'webp' })
  format: string; // File format (should always be webp after processing)

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  originalName: string; // Store the original filename

  @Prop({ required: true })
  originalSize: number; // Original file size before optimization

  @Prop({ required: true })
  compressionRatio: number; // Percentage of size reduction achieved
}

export const ImageSchema = SchemaFactory.createForClass(Image);