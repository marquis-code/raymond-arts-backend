import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ChatNotification extends Document {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  data: Record<string, any>;

  @Prop({ default: false })
  isRead: boolean;
}

export const ChatNotificationSchema = SchemaFactory.createForClass(ChatNotification);