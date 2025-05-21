import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CertificateDocument = Certificate & Document;

@Schema({ timestamps: true })
export class Certificate {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  certificateNumber: string;

  @Prop({ required: true })
  issueDate: Date;

  @Prop()
  certificateUrl: string;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);

// Create a compound index to ensure a user can only have one certificate per course
CertificateSchema.index({ user: 1, course: 1 }, { unique: true });