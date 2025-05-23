import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { Chat, MessageSender } from './schemas/chat.schema';
import { ChatNotificationsService } from '../chat-notifications/chat-notifications.service';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ChatService {

  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
    @Inject(forwardRef(() => ChatNotificationsService)) private readonly chatNotificationsService: ChatNotificationsService
  ) {}

  async createChat(email: string, fullName: string, initialMessage: string): Promise<any> {
    const newChat = new this.chatModel({
      email,
      fullName,
      messages: [
        {
          content: initialMessage,
          sender: MessageSender.USER,
          timestamp: new Date(),
        },
      ],
    });
    
    const savedChat = await newChat.save();
    
    // Create notification for admin
    await this.chatNotificationsService.create({
      type: 'chat',
      message: `New chat from ${fullName} (${email})`,
      data: { chatId: savedChat._id },
      isRead: false
    });
    
    return savedChat;
  }

  async addMessage(
    chatId: string,
    content: string,
    sender: MessageSender,
  ): Promise<any> {
    const chat = await this.chatModel.findById(chatId);
    
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    chat.messages.push({
      content,
      sender,
      timestamp: new Date(),
    });
    
    if (sender === MessageSender.ADMIN) {
      chat.isRead = true;
    } else {
      chat.isRead = false;
      
      // Create notification for admin when user sends a message
      await this.chatNotificationsService.create({
        type: 'chat_message',
        message: `New message from ${chat.fullName}`,
        data: { chatId: chat._id },
        isRead: false
      });
    }
    
    return chat.save();
  }

  async getChat(chatId: string): Promise<any> {
    return this.chatModel.findById(chatId).exec();
  }

  async getChatByEmail(email: string): Promise<any> {
    return this.chatModel.findOne({ email, isActive: true }).exec();
  }

  async getAllActiveChats(): Promise<any[]> {
    return this.chatModel.find({ isActive: true }).sort({ updatedAt: -1 }).exec();
  }

  async markChatAsRead(chatId: string): Promise<any> {
    return this.chatModel
      .findByIdAndUpdate(chatId, { isRead: true }, { new: true })
      .exec();
  }

  async closeChat(chatId: string): Promise<any> {
    return this.chatModel
      .findByIdAndUpdate(chatId, { isActive: false }, { new: true })
      .exec();
  }
}