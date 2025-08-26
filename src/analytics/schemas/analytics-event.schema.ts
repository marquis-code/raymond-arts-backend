import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnalyticsEventDocument = AnalyticsEvent & Document;

@Schema({ timestamps: true })
export class AnalyticsEvent {
  @Prop({ required: true })
  eventType: string; // 'page_view', 'click', 'custom_event'

  @Prop({ required: true })
  page: string;

  @Prop()
  title?: string;

  @Prop()
  referrer?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  sessionId?: string;

  @Prop()
  userId?: string;

  @Prop({ type: Object })
  customData?: Record<string, any>;

  @Prop()
  country?: string;

  @Prop()
  city?: string;

  @Prop()
  device?: string;

  @Prop()
  browser?: string;

  @Prop()
  os?: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const AnalyticsEventSchema = SchemaFactory.createForClass(AnalyticsEvent);


// Add indexes for better query performance
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ page: 1, timestamp: -1 });
AnalyticsEventSchema.index({ timestamp: -1 });