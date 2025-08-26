import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PageAnalyticsDocument = PageAnalytics & Document;

@Schema({ timestamps: true })
export class PageAnalytics {
  @Prop({ required: true, unique: true })
  page: string;

  @Prop({ default: 0 })
  totalViews: number;

  @Prop({ default: 0 })
  uniqueViews: number;

  @Prop({ default: 0 })
  bounceRate: number;

  @Prop({ default: 0 })
  avgTimeOnPage: number;

  @Prop({ default: Date.now })
  lastUpdated: Date;
}

export const PageAnalyticsSchema = SchemaFactory.createForClass(PageAnalytics);