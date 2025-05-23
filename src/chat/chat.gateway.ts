import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { MessageSender } from './schemas/chat.schema';

interface InitChatDto {
  email: string;
  fullName: string;
  message: string;
}

interface ChatMessageDto {
  chatId: string;
  message: string;
  sender: MessageSender;
}

interface TypingDto {
  chatId: string;
  isTyping: boolean;
  userInfo?: {
    fullName: string;
    email: string;
  };
}

interface UserPresenceDto {
  chatId: string;
  status: 'online' | 'offline' | 'away';
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers: Map<string, { 
    socket: Socket; 
    chatId?: string; 
    userInfo?: any; 
    isAdmin: boolean;
    lastSeen: Date;
  }> = new Map();
  private typingUsers: Map<string, { chatId: string; userInfo: any; timeout?: NodeJS.Timeout }> = new Map();

  constructor(private readonly chatService: ChatService) {}

  afterInit() {
    this.logger.log('Chat WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    const clientId = client.id;
    this.logger.log(`Client connected: ${clientId}`);
    
    // Store client in connected users map
    this.connectedUsers.set(clientId, {
      socket: client,
      isAdmin: false,
      lastSeen: new Date(),
    });

    // Send welcome message
    client.emit('connected', {
      success: true,
      message: 'Connected to chat server',
      clientId,
    });
  }

  handleDisconnect(client: Socket) {
    const clientId = client.id;
    this.logger.log(`Client disconnected: ${clientId}`);
    
    const userData = this.connectedUsers.get(clientId);
    
    if (userData) {
      // Handle typing cleanup
      this.handleStopTyping(client, { chatId: userData.chatId || '', isTyping: false });
      
      // Notify about user going offline
      if (userData.chatId) {
        this.handleUserPresence(client, {
          chatId: userData.chatId,
          status: 'offline',
        });
      }
      
      // Remove from connected users
      this.connectedUsers.delete(clientId);
    }
  }

  @SubscribeMessage('initChat')
  async handleInitChat(client: Socket, data: InitChatDto) {
    try {
      this.logger.log(`Initializing chat for ${data.email}`);
      
      // Check if user already has an active chat
      const existingChat = await this.chatService.getChatByEmail(data.email);
      
      if (existingChat) {
        // Add the new message to existing chat
        const updatedChat = await this.chatService.addMessage(
          existingChat._id.toString(),
          data.message,
          MessageSender.USER,
        );
        
        // Join the room
        client.join(existingChat._id.toString());
        
        // Update user data
        const userData = this.connectedUsers.get(client.id);
        if (userData) {
          userData.chatId = existingChat._id.toString();
          userData.userInfo = { fullName: data.fullName, email: data.email };
        }
        
        // Emit to admin room
        this.server.to('admin').emit('newChatMessage', {
          chatId: existingChat._id,
          message: data.message,
          sender: MessageSender.USER,
          fullName: existingChat.fullName,
          email: existingChat.email,
          timestamp: new Date(),
        });
        
        // Send user presence update
        this.handleUserPresence(client, {
          chatId: existingChat._id.toString(),
          status: 'online',
        });
        
        return {
          success: true,
          chatId: existingChat._id,
          messages: updatedChat.messages,
          isExistingChat: true,
        };
      }
      
      // Create a new chat
      const newChat = await this.chatService.createChat(
        data.email,
        data.fullName,
        data.message,
      );
      
      // Join the room
      client.join(newChat._id.toString());
      
      // Update user data
      const userData = this.connectedUsers.get(client.id);
      if (userData) {
        userData.chatId = newChat._id.toString();
        userData.userInfo = { fullName: data.fullName, email: data.email };
      }
      
      // Emit to admin room
      this.server.to('admin').emit('newChat', {
        chatId: newChat._id,
        fullName: newChat.fullName,
        email: newChat.email,
        message: data.message,
        timestamp: new Date(),
      });
      
      // Send user presence update
      this.handleUserPresence(client, {
        chatId: newChat._id.toString(),
        status: 'online',
      });
      
      this.logger.log(`New chat created: ${newChat._id}`);
      
      return {
        success: true,
        chatId: newChat._id,
        messages: newChat.messages,
        isExistingChat: false,
      };
    } catch (error) {
      this.logger.error(`Error initializing chat: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, data: ChatMessageDto) {
    try {
      this.logger.log(`Sending message to chat ${data.chatId}`);
      
      const chat = await this.chatService.addMessage(
        data.chatId,
        data.message,
        data.sender,
      );
      
      // Stop typing indicator for this user
      this.handleStopTyping(client, { chatId: data.chatId, isTyping: false });
      
      // Broadcast to the specific chat room
      this.server.to(data.chatId).emit('newMessage', {
        chatId: data.chatId,
        message: data.message,
        sender: data.sender,
        timestamp: new Date(),
        messageId: chat.messages[chat.messages.length - 1]._id,
      });
      
      // Handle notifications based on sender
      if (data.sender === MessageSender.ADMIN) {
        // Admin is sending message
        this.server.to('admin').emit('adminMessage', {
          chatId: data.chatId,
          message: data.message,
          timestamp: new Date(),
        });
        
        // Mark chat as read since admin responded
        await this.chatService.markChatAsRead(data.chatId);
        
        // Notify admins that chat has been read
        this.server.to('admin').emit('chatRead', {
          chatId: data.chatId,
        });
      } else {
        // User is sending message - emit to admin room
        this.server.to('admin').emit('newChatMessage', {
          chatId: data.chatId,
          message: data.message,
          sender: data.sender,
          fullName: chat.fullName,
          email: chat.email,
          timestamp: new Date(),
        });
      }
      
      return {
        success: true,
        message: 'Message sent successfully',
        messageId: chat.messages[chat.messages.length - 1]._id,
      };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(client: Socket, data: { chatId: string }) {
    try {
      client.join(data.chatId);
      
      // Update user data
      const userData = this.connectedUsers.get(client.id);
      if (userData) {
        userData.chatId = data.chatId;
      }
      
      this.logger.log(`Client ${client.id} joined chat ${data.chatId}`);
      
      return {
        success: true,
        message: `Joined chat ${data.chatId}`,
      };
    } catch (error) {
      this.logger.error(`Error joining chat: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @SubscribeMessage('leaveChat')
  handleLeaveChat(client: Socket, data: { chatId: string }) {
    try {
      client.leave(data.chatId);
      
      // Update user data
      const userData = this.connectedUsers.get(client.id);
      if (userData) {
        userData.chatId = undefined;
      }
      
      // Handle user going offline
      this.handleUserPresence(client, {
        chatId: data.chatId,
        status: 'offline',
      });
      
      this.logger.log(`Client ${client.id} left chat ${data.chatId}`);
      
      return {
        success: true,
        message: `Left chat ${data.chatId}`,
      };
    } catch (error) {
      this.logger.error(`Error leaving chat: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @SubscribeMessage('joinAdminRoom')
  handleJoinAdminRoom(client: Socket) {
    try {
      client.join('admin');
      
      // Update user data
      const userData = this.connectedUsers.get(client.id);
      if (userData) {
        userData.isAdmin = true;
      }
      
      this.logger.log(`Client ${client.id} joined admin room`);
      
      return {
        success: true,
        message: 'Joined admin room',
      };
    } catch (error) {
      this.logger.error(`Error joining admin room: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @SubscribeMessage('markChatAsRead')
  async handleMarkChatAsRead(data: { chatId: string }) {
    try {
      await this.chatService.markChatAsRead(data.chatId);
      
      // Notify admins that chat has been read
      this.server.to('admin').emit('chatRead', {
        chatId: data.chatId,
        timestamp: new Date(),
      });
      
      this.logger.log(`Chat ${data.chatId} marked as read`);
      
      return {
        success: true,
        message: 'Chat marked as read',
      };
    } catch (error) {
      this.logger.error(`Error marking chat as read: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @SubscribeMessage('closeChat')
  async handleCloseChat(data: { chatId: string }) {
    try {
      await this.chatService.closeChat(data.chatId);
      
      // Notify all clients in the chat room that the chat is closed
      this.server.to(data.chatId).emit('chatClosed', {
        chatId: data.chatId,
        timestamp: new Date(),
        message: 'This chat has been closed by an administrator.',
      });
      
      // Notify admins that chat has been closed
      this.server.to('admin').emit('chatClosed', {
        chatId: data.chatId,
        timestamp: new Date(),
      });
      
      this.logger.log(`Chat ${data.chatId} closed`);
      
      return {
        success: true,
        message: 'Chat closed successfully',
      };
    } catch (error) {
      this.logger.error(`Error closing chat: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, data: TypingDto) {
    try {
      const userData = this.connectedUsers.get(client.id);
      
      if (data.isTyping) {
        // User started typing
        const typingData = {
          chatId: data.chatId,
          userInfo: data.userInfo || userData?.userInfo,
        };
        
        // Clear existing timeout
        const existingTyping = this.typingUsers.get(client.id);
        if (existingTyping?.timeout) {
          clearTimeout(existingTyping.timeout);
        }
        
        // Set new timeout to auto-stop typing after 3 seconds
        const timeout = setTimeout(() => {
          this.handleStopTyping(client, { chatId: data.chatId, isTyping: false });
        }, 3000);
        
        this.typingUsers.set(client.id, { ...typingData, timeout });
        
        // Broadcast typing indicator to chat room (except sender)
        client.to(data.chatId).emit('userTyping', {
          chatId: data.chatId,
          userInfo: typingData.userInfo,
          isTyping: true,
        });
        
        // Notify admins if user is typing
        if (!userData?.isAdmin) {
          this.server.to('admin').emit('userTyping', {
            chatId: data.chatId,
            userInfo: typingData.userInfo,
            isTyping: true,
          });
        }
      } else {
        this.handleStopTyping(client, data);
      }
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error handling typing: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  private handleStopTyping(client: Socket, data: { chatId: string; isTyping: boolean }) {
    const typingData = this.typingUsers.get(client.id);
    
    if (typingData) {
      // Clear timeout
      if (typingData.timeout) {
        clearTimeout(typingData.timeout);
      }
      
      // Remove from typing users
      this.typingUsers.delete(client.id);
      
      // Broadcast stop typing to chat room
      client.to(data.chatId).emit('userTyping', {
        chatId: data.chatId,
        userInfo: typingData.userInfo,
        isTyping: false,
      });
      
      // Notify admins
      const userData = this.connectedUsers.get(client.id);
      if (!userData?.isAdmin) {
        this.server.to('admin').emit('userTyping', {
          chatId: data.chatId,
          userInfo: typingData.userInfo,
          isTyping: false,
        });
      }
    }
  }

  @SubscribeMessage('userPresence')
  handleUserPresence(client: Socket, data: UserPresenceDto) {
    try {
      const userData = this.connectedUsers.get(client.id);
      
      if (userData) {
        userData.lastSeen = new Date();
      }
      
      // Broadcast presence to chat room
      client.to(data.chatId).emit('userPresence', {
        chatId: data.chatId,
        status: data.status,
        timestamp: new Date(),
        userInfo: userData?.userInfo,
      });
      
      // Notify admins about user presence
      if (!userData?.isAdmin) {
        this.server.to('admin').emit('userPresence', {
          chatId: data.chatId,
          status: data.status,
          timestamp: new Date(),
          userInfo: userData?.userInfo,
        });
      }
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error handling user presence: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('getChatHistory')
  async handleGetChatHistory(client: Socket, data: { chatId: string; limit?: number; offset?: number }) {
    try {
      const chat = await this.chatService.getChat(data.chatId);
      
      if (!chat) {
        return {
          success: false,
          error: 'Chat not found',
        };
      }
      
      const limit = data.limit || 50;
      const offset = data.offset || 0;
      const messages = chat.messages.slice(offset, offset + limit);
      
      return {
        success: true,
        messages,
        hasMore: chat.messages.length > offset + limit,
      };
    } catch (error) {
      this.logger.error(`Error getting chat history: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(data: { chatId: string }) {
    try {
      const onlineUsers = Array.from(this.connectedUsers.values())
        .filter(user => user.chatId === data.chatId)
        .map(user => ({
          userInfo: user.userInfo,
          isAdmin: user.isAdmin,
          lastSeen: user.lastSeen,
        }));
      
      return {
        success: true,
        onlineUsers,
        count: onlineUsers.length,
      };
    } catch (error) {
      this.logger.error(`Error getting online users: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Method to send system messages
  async sendSystemMessage(chatId: string, message: string) {
    try {
      await this.chatService.addMessage(chatId, message, MessageSender.SYSTEM);
      
      this.server.to(chatId).emit('newMessage', {
        chatId,
        message,
        sender: MessageSender.SYSTEM,
        timestamp: new Date(),
      });
      
      this.logger.log(`System message sent to chat ${chatId}`);
    } catch (error) {
      this.logger.error(`Error sending system message: ${error.message}`);
    }
  }

  // Method to broadcast announcements to all connected users
  broadcastAnnouncement(message: string) {
    this.server.emit('announcement', {
      message,
      timestamp: new Date(),
    });
    
    this.logger.log(`Announcement broadcasted: ${message}`);
  }
}