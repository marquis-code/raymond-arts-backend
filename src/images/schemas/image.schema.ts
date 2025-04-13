import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { Document } from "mongoose"

export type ImageDocument = Image & Document

@Schema({ timestamps: true })
export class Image {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  url: string

  @Prop({ required: true })
  publicId: string

  @Prop()
  description: string

  @Prop()
  tags: string[]

  @Prop()
  size: number

  @Prop()
  format: string

  @Prop()
  width: number

  @Prop()
  height: number
}

export const ImageSchema = SchemaFactory.createForClass(Image)
