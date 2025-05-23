import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatNotification } from './schemas/chat-notification.schema';

@Injectable()
export class ChatNotificationsService {
  constructor(
    @InjectModel(ChatNotification.name) private readonly chatNotificationModel: Model<ChatNotification>
  ){}

  async create(notificationData: Partial<ChatNotification>): Promise<ChatNotification> {
    const newNotification = new this.chatNotificationModel(notificationData);
    return newNotification.save();
  }

  async findAll(): Promise<ChatNotification[]> {
    return this.chatNotificationModel.find().sort({ createdAt: -1 }).exec();
  }

  async findUnread(): Promise<ChatNotification[]> {
    return this.chatNotificationModel
      .find({ isRead: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(id: string): Promise<ChatNotification> {
    return this.chatNotificationModel
      .findByIdAndUpdate(id, { isRead: true }, { new: true })
      .exec();
  }

  async markAllAsRead(): Promise<void> {
    await this.chatNotificationModel.updateMany(
      { isRead: false },
      { isRead: true }
    );
  }

  async remove(id: string): Promise<ChatNotification> {
    return this.chatNotificationModel.findByIdAndDelete(id).exec();
  }

  async getCount(): Promise<number> {
    return this.chatNotificationModel.countDocuments({ isRead: false }).exec();
  }
}