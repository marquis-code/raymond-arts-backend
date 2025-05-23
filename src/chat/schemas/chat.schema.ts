import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum MessageSender {
  USER = 'user',
  ADMIN = 'admin',
  SYSTEM = 'system',
}

@Schema()
export class Message {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true, enum: MessageSender })
  sender: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

@Schema({ timestamps: true })
export class Chat extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ type: [MessageSchema] })
  messages: Message[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isRead: boolean;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);