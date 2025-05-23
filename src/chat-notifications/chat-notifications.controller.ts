import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Post,
} from '@nestjs/common';
import { ChatNotificationsService } from './chat-notifications.service';
import { ChatNotification } from './schemas/chat-notification.schema';

@Controller('chat-notifications')
export class ChatNotificationsController {
  constructor(private readonly chatNotificationsService: ChatNotificationsService) {}

  @Get()
  async findAll(): Promise<ChatNotification[]> {
    return this.chatNotificationsService.findAll();
  }

  @Get('unread')
  async findUnread(): Promise<ChatNotification[]> {
    return this.chatNotificationsService.findUnread();
  }

  @Get('count')
  async getCount(): Promise<{ count: number }> {
    const count = await this.chatNotificationsService.getCount();
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string): Promise<ChatNotification> {
    return this.chatNotificationsService.markAsRead(id);
  }

  @Post('read-all')
  async markAllAsRead(): Promise<{ success: boolean }> {
    await this.chatNotificationsService.markAllAsRead();
    return { success: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ChatNotification> {
    return this.chatNotificationsService.remove(id);
  }
}