// import {
//     WebSocketGateway,
//     SubscribeMessage,
//     WebSocketServer,
//   } from '@nestjs/websockets';
//   import { Server, Socket } from 'socket.io';
//   import { ChatService } from './chat.service';
//   import { MessageSender } from './schemas/chat.schema';
  
//   interface InitChatDto {
//     email: string;
//     fullName: string;
//     message: string;
//   }
  
//   interface ChatMessageDto {
//     chatId: string;
//     message: string;
//     sender: MessageSender;
//   }
  
//   @WebSocketGateway({
//     cors: {
//       origin: '*',
//     },
//   })
//   export class ChatGateway {
//     server: Server;
//     clients: { [key: string]: Socket } = {};
  
//     constructor(private readonly chatService: ChatService) {}
  
//     @SubscribeMessage('initChat')
//     async handleInitChat(client: Socket, data: InitChatDto) {
//       try {
//         // Check if user already has an active chat
//         const existingChat = await this.chatService.getChatByEmail(data.email);
        
//         if (existingChat) {
//           // Add the new message to existing chat
//           const updatedChat = await this.chatService.addMessage(
//             existingChat._id.toString(),
//             data.message,
//             MessageSender.USER,
//           );
          
//           // Join the room
//           client.join(existingChat._id.toString());
//           this.clients[existingChat._id.toString()] = client;
          
//           // Emit to admin that there's a new message
//           this.server.to('admin').emit('newChatMessage', {
//             chatId: existingChat._id,
//             message: data.message,
//             sender: MessageSender.USER,
//             fullName: existingChat.fullName,
//             email: existingChat.email,
//             timestamp: new Date(),
//           });
          
//           return {
//             success: true,
//             chatId: existingChat._id,
//             messages: updatedChat.messages,
//           };
//         }
        
//         // Create a new chat
//         const newChat = await this.chatService.createChat(
//           data.email,
//           data.fullName,
//           data.message,
//         );
        
//         // Join the room
//         client.join(newChat._id.toString());
//         this.clients[newChat._id.toString()] = client;
        
//         // Emit to admin that there's a new chat
//         this.server.to('admin').emit('newChat', {
//           chatId: newChat._id,
//           fullName: newChat.fullName,
//           email: newChat.email,
//           message: data.message,
//           timestamp: new Date(),
//         });
        
//         return {
//           success: true,
//           chatId: newChat._id,
//           messages: newChat.messages,
//         };
//       } catch (error) {
//         return {
//           success: false,
//           error: error.message,
//         };
//       }
//     }
  
//     @SubscribeMessage('sendMessage')
//     async handleSendMessage(client: Socket, data: ChatMessageDto) {
//       try {
//         const chat = await this.chatService.addMessage(
//           data.chatId,
//           data.message,
//           data.sender,
//         );
        
//         // Broadcast to the specific chat room
//         this.server.to(data.chatId).emit('newMessage', {
//           chatId: data.chatId,
//           message: data.message,
//           sender: data.sender,
//           timestamp: new Date(),
//         });
        
//         // If admin is sending, also emit to admin room for all admins to see
//         if (data.sender === MessageSender.ADMIN) {
//           this.server.to('admin').emit('adminMessage', {
//             chatId: data.chatId,
//             message: data.message,
//             timestamp: new Date(),
//           });
//         } else {
//           // If user is sending, emit to admin room
//           this.server.to('admin').emit('newChatMessage', {
//             chatId: data.chatId,
//             message: data.message,
//             sender: data.sender,
//             fullName: chat.fullName,
//             email: chat.email,
//             timestamp: new Date(),
//           });
//         }
        
//         return {
//           success: true,
//           message: 'Message sent successfully',
//         };
//       } catch (error) {
//         return {
//           success: false,
//           error: error.message,
//         };
//       }
//     }
  
//     @SubscribeMessage('joinChat')
//     handleJoinChat(client: Socket, data: { chatId: string }) {
//       client.join(data.chatId);
//       this.clients[data.chatId] = client;
//       return {
//         success: true,
//         message: `Joined chat ${data.chatId}`,
//       };
//     }
  
//     @SubscribeMessage('joinAdminRoom')
//     handleJoinAdminRoom(client: Socket) {
//       client.join('admin');
//       return {
//         success: true,
//         message: 'Joined admin room',
//       };
//     }
  
//     @SubscribeMessage('markChatAsRead')
//     async handleMarkChatAsRead(data: { chatId: string }) {
//       try {
//         await this.chatService.markChatAsRead(data.chatId);
        
//         // Notify admins that chat has been read
//         this.server.to('admin').emit('chatRead', {
//           chatId: data.chatId,
//         });
        
//         return {
//           success: true,
//           message: 'Chat marked as read',
//         };
//       } catch (error) {
//         return {
//           success: false,
//           error: error.message,
//         };
//       }
//     }
  
//     @SubscribeMessage('closeChat')
//     async handleCloseChat(data: { chatId: string }) {
//       try {
//         await this.chatService.closeChat(data.chatId);
        
//         // Notify all clients in the chat room that the chat is closed
//         this.server.to(data.chatId).emit('chatClosed', {
//           chatId: data.chatId,
//         });
        
//         // Notify admins that chat has been closed
//         this.server.to('admin').emit('chatClosed', {
//           chatId: data.chatId,
//         });
        
//         return {
//           success: true,
//           message: 'Chat closed successfully',
//         };
//       } catch (error) {
//         return {
//           success: false,
//           error: error.message,
//         };
//       }
//     }
//   }

import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('initChat')
  async handleInitChat(client: Socket, data: InitChatDto) {
    try {
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
        
        // Emit to admin that there's a new message
        this.server.to('admin').emit('newChatMessage', {
          chatId: existingChat._id,
          message: data.message,
          sender: MessageSender.USER,
          fullName: existingChat.fullName,
          email: existingChat.email,
          timestamp: new Date(),
        });
        
        return {
          success: true,
          chatId: existingChat._id,
          messages: updatedChat.messages,
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
      
      // Emit to admin that there's a new chat
      this.server.to('admin').emit('newChat', {
        chatId: newChat._id,
        fullName: newChat.fullName,
        email: newChat.email,
        message: data.message,
        timestamp: new Date(),
      });
      
      return {
        success: true,
        chatId: newChat._id,
        messages: newChat.messages,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, data: ChatMessageDto) {
    try {
      const chat = await this.chatService.addMessage(
        data.chatId,
        data.message,
        data.sender,
      );
      
      // Broadcast to the specific chat room
      this.server.to(data.chatId).emit('newMessage', {
        chatId: data.chatId,
        message: data.message,
        sender: data.sender,
        timestamp: new Date(),
      });
      
      // If admin is sending, also emit to admin room for all admins to see
      if (data.sender === MessageSender.ADMIN) {
        this.server.to('admin').emit('adminMessage', {
          chatId: data.chatId,
          message: data.message,
          timestamp: new Date(),
        });
      } else {
        // If user is sending, emit to admin room
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
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(client: Socket, data: { chatId: string }) {
    client.join(data.chatId);
    return {
      success: true,
      message: `Joined chat ${data.chatId}`,
    };
  }

  @SubscribeMessage('joinAdminRoom')
  handleJoinAdminRoom(client: Socket) {
    client.join('admin');
    return {
      success: true,
      message: 'Joined admin room',
    };
  }

  @SubscribeMessage('markChatAsRead')
  async handleMarkChatAsRead(data: { chatId: string }) {
    try {
      await this.chatService.markChatAsRead(data.chatId);
      
      // Notify admins that chat has been read
      this.server.to('admin').emit('chatRead', {
        chatId: data.chatId,
      });
      
      return {
        success: true,
        message: 'Chat marked as read',
      };
    } catch (error) {
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
      });
      
      // Notify admins that chat has been closed
      this.server.to('admin').emit('chatClosed', {
        chatId: data.chatId,
      });
      
      return {
        success: true,
        message: 'Chat closed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}