// src/schemas/commission-request.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommissionRequestDocument = CommissionRequest & Document;

export enum CommissionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class CommissionRequest {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  deadline?: Date;

  @Prop({ type: Types.ObjectId, ref: 'DrawingType', required: true })
  drawingType: Types.ObjectId;

  @Prop({ required: false})
  mainPhoto: string;

  @Prop({ required: false})
  optionalPhoto1?: string;

  @Prop()
  optionalPhoto2?: string;

  @Prop({ enum: CommissionStatus, default: CommissionStatus.PENDING })
  status: CommissionStatus;

  @Prop()
  estimatedPrice?: number;

  @Prop()
  finalPrice?: number;

  @Prop()
  notes?: string;
}

export const CommissionRequestSchema = SchemaFactory.createForClass(CommissionRequest);