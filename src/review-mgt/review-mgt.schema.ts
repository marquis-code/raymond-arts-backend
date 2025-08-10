import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewMgtDocument = ReviewMgt & Document;

@Schema({ timestamps: true })
export class ReviewMgt {
  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  comment: string;

  @Prop({ 
    required: true, 
    min: 1, 
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Star rating must be an integer between 1 and 5'
    }
  })
  starRating: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ReviewMgtSchema = SchemaFactory.createForClass(ReviewMgt);
