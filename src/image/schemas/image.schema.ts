import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImageDocument = Image & Document;

@Schema({ 
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class Image {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  cloudinaryUrl: string;

  @Prop({ required: true, unique: true })
  cloudinaryPublicId: string;

  @Prop({ required: true })
  secureUrl: string;

  @Prop()
  format: string;

  @Prop()
  width: number;

  @Prop()
  height: number;

  @Prop()
  bytes: number;

  @Prop({ default: 'uploads' })
  folder: string;

  @Prop({ default: 'image' })
  resourceType: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: '' })
  description: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ImageSchema = SchemaFactory.createForClass(Image);

// Add indexes for better performance
ImageSchema.index({ cloudinaryPublicId: 1 });
ImageSchema.index({ tags: 1 });
ImageSchema.index({ createdAt: -1 });
ImageSchema.index({ isActive: 1 });