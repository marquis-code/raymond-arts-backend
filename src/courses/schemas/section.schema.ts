import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Lesson } from './lesson.schema';
import mongoose from "mongoose"

export type SectionDocument = Section & Document;

@Schema({ timestamps: true })
export class Section {
  _id: mongoose.Schema.Types.ObjectId; // Make this required, not optional,

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  order: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Lesson' }] })
  lessons: Lesson[];
}

export const SectionSchema = SchemaFactory.createForClass(Section);