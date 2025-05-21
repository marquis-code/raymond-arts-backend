import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EnrollmentDocument = Enrollment & Document;

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0 })
  progressPercentage: number;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ type: [{ lessonId: MongooseSchema.Types.ObjectId, completed: Boolean }] })
  completedLessons: { lessonId: MongooseSchema.Types.ObjectId; completed: boolean }[];

  @Prop()
  lastAccessedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Payment' })
  payment: MongooseSchema.Types.ObjectId;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

// Create a compound index to ensure a user can only enroll once in a course
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });