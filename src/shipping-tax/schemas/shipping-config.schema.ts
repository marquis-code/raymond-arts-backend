import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ShippingConfig extends Document {
  @Prop({ required: true, unique: true })
  countryCode: string;

  @Prop({ required: true })
  countryName: string;

  @Prop({ required: true, default: 60 })
  shippingRate: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;
}

export const ShippingConfigSchema = SchemaFactory.createForClass(ShippingConfig);