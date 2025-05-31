import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PromoSaleDocument = PromoSale & Document;

export enum PromoSaleStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class PromoSale {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0, max: 100 })
  discountPercentage: number;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ default: null })
  endDate: Date; // null means lifetime promo

  @Prop({ 
    enum: PromoSaleStatus, 
    default: PromoSaleStatus.PENDING 
  })
  status: PromoSaleStatus;

  @Prop({ default: false })
  isLifetime: boolean;

  @Prop({ default: 0 })
  priority: number; // Higher priority promos activate first

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const PromoSaleSchema = SchemaFactory.createForClass(PromoSale);

// Create index for efficient querying
PromoSaleSchema.index({ status: 1, startDate: 1, endDate: 1, priority: -1 });