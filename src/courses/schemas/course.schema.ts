import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Section } from './section.schema';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  longDescription: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: 0, min: 0 })
  discountPrice: number;

  @Prop()
  thumbnail: string;

  @Prop()
  previewVideo: string;

  @Prop([String])
  tags: string[];

  @Prop({ default: 'draft', enum: ['draft', 'published', 'archived'] })
  status: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Section' }] })
  sections: Section[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  instructor: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0 })
  enrollmentCount: number;

  @Prop({ default: 0 })
  totalLessons: number;

  @Prop({ default: 0 })
  durationInMinutes: number;

  @Prop({ default: [] })
  requirements: string[];

  @Prop({ default: [] })
  objectives: string[];

  @Prop({ default: 'beginner', enum: ['beginner', 'intermediate', 'advanced'] })
  level: string;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: 0 })
  reviewCount: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Add text index for search functionality
CourseSchema.index({ title: 'text', description: 'text', tags: 'text' });