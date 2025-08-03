import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { Document } from "mongoose"

export type OriginalDocument = Originals & Document

@Schema()
export class Originals {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  description: string

  @Prop({ type: [String], default: [] })
  images: string[]

  @Prop({ type: Number, required: true, default: 0 }) // Added position field
  position: number
}

export const OriginalsSchema = SchemaFactory.createForClass(Originals)
