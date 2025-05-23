import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './schemas/chat.schema';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('active')
  async getAllActiveChats(): Promise<Chat[]> {
    return this.chatService.getAllActiveChats();
  }

  @Get(':id')
  async getChat(id: string): Promise<Chat> {
    return this.chatService.getChat(id);
  }

  @Patch(':id/read')
  async markChatAsRead(id: string): Promise<Chat> {
    return this.chatService.markChatAsRead(id);
  }

  @Patch(':id/close')
  async closeChat(id: string): Promise<Chat> {
    return this.chatService.closeChat(id);
  }
}