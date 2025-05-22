import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import mongoose from 'mongoose';

export type LessonDocument = Lesson & Document;

@Schema({ timestamps: true })
export class Lesson {
  _id: mongoose.Schema.Types.ObjectId; // Make this required, not optional,
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  order: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Section', required: true })
  section: mongoose.Schema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: mongoose.Schema.Types.ObjectId;

  @Prop({ enum: ['video', 'article', 'quiz'], default: 'video' })
  type: string;

  @Prop()
  videoUrl: string;

  @Prop()
  content: string;

  @Prop({ default: 0 })
  durationInMinutes: number;

  @Prop({ default: false })
  isPreview: boolean;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);