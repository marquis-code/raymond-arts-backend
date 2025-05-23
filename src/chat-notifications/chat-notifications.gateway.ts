// import {
//   WebSocketGateway,
//   WebSocketServer,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { ChatNotificationsService } from './chat-notifications.service';

// @WebSocketGateway({
//   cors: {
//     origin: '*',
//   },
// })
// export class ChatNotificationsGateway
//   implements OnGatewayConnection, OnGatewayDisconnect
// {
//   @WebSocketServer()
//   server: Server;

//   constructor(private readonly chatNotificationsService: ChatNotificationsService) {}

//   async handleConnection(client: Socket) {
//     // When an admin connects, send the unread notification count
//     const count = await this.chatNotificationsService.getCount();
//     client.emit('notificationCount', { count });
//   }

//   handleDisconnect() {
//     // Handle disconnect if needed
//   }

//   // Method to be called from other services to emit notifications
//   async emitNotification(notification: any) {
//     // Emit to all connected clients
//     this.server.emit('newNotification', notification);
    
//     // Update notification count
//     const count = await this.chatNotificationsService.getCount();
//     this.server.emit('notificationCount', { count });
//   }
// }

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatNotificationsService } from './chat-notifications.service';

interface NotificationPayload {
  id?: string;
  type: string;
  message: string;
  data?: Record<string, any>;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class ChatNotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(ChatNotificationsGateway.name);
  private connectedClients: Map<string, { socket: Socket; isAdmin: boolean }> = new Map();

  constructor(private readonly chatNotificationsService: ChatNotificationsService) {}

  afterInit() {
    this.logger.log('Chat Notifications WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    const clientId = client.id;
    this.logger.log(`Client connected: ${clientId}`);
    
    // Store client in connected clients map (default as non-admin)
    this.connectedClients.set(clientId, { socket: client, isAdmin: false });
    
    // Send current notification count to the client
    try {
      const count = await this.chatNotificationsService.getCount();
      client.emit('notificationCount', { count });
    } catch (error) {
      this.logger.error(`Error fetching notification count: ${error.message}`);
    }
  }

  handleDisconnect(client: Socket) {
    const clientId = client.id;
    this.logger.log(`Client disconnected: ${clientId}`);
    
    // Remove client from connected clients map
    this.connectedClients.delete(clientId);
  }

  handleRegisterAdmin(client: Socket, data: { token?: string }) {
    // In a real application, you would validate the admin token here
    // For now, we'll just mark the client as an admin
    const clientId = client.id;
    
    if (this.connectedClients.has(clientId)) {
      this.connectedClients.set(clientId, { 
        socket: client, 
        isAdmin: true 
      });
      
      // Join admin room
      client.join('admin');
      
      this.logger.log(`Client ${clientId} registered as admin`);
      return { success: true, message: 'Registered as admin' };
    }
    
    return { success: false, message: 'Client not found' };
  }

  @SubscribeMessage('subscribeToNotifications')
  async handleSubscribeToNotifications(client: Socket) {
    try {
      // Get all unread notifications
      const notifications = await this.chatNotificationsService.findUnread();
      
      // Send notifications to client
      client.emit('notifications', notifications);
      
      // Get notification count
      const count = await this.chatNotificationsService.getCount();
      client.emit('notificationCount', { count });
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error subscribing to notifications: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('markNotificationAsRead')
  async handleMarkNotificationAsRead(client: Socket, data: { id: string }) {
    try {
      // Mark notification as read
      await this.chatNotificationsService.markAsRead(data.id);
      
      // Get updated notification count
      const count = await this.chatNotificationsService.getCount();
      
      // Broadcast updated count to all clients
      this.broadcastNotificationCount(count);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error marking notification as read: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('markAllNotificationsAsRead')
  async handleMarkAllNotificationsAsRead(client: Socket) {
    try {
      // Mark all notifications as read
      await this.chatNotificationsService.markAllAsRead();
      
      // Broadcast updated count to all clients
      this.broadcastNotificationCount(0);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error marking all notifications as read: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('deleteNotification')
  async handleDeleteNotification(client: Socket, data: { id: string }) {
    try {
      // Delete notification
      await this.chatNotificationsService.remove(data.id);
      
      // Get updated notification count
      const count = await this.chatNotificationsService.getCount();
      
      // Broadcast updated count to all clients
      this.broadcastNotificationCount(count);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error deleting notification: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Method to be called from other services to create and emit notifications
  async createAndEmitNotification(notificationData: NotificationPayload) {
    try {
      // Create notification in database
      const notification = await this.chatNotificationsService.create({
        type: notificationData.type,
        message: notificationData.message,
        data: notificationData.data || {},
        isRead: false
      });
      
      // Emit to all connected clients
      this.broadcastNewNotification(notification);
      
      // Get updated notification count
      const count = await this.chatNotificationsService.getCount();
      
      // Broadcast updated count to all clients
      this.broadcastNotificationCount(count);
      
      return notification;
    } catch (error) {
      this.logger.error(`Error creating and emitting notification: ${error.message}`);
      throw error;
    }
  }

  // Method to broadcast a new notification to all connected clients
  private broadcastNewNotification(notification: any) {
    // Emit to all clients
    this.server.emit('newNotification', notification);
    
    // Emit to admin room specifically
    this.server.to('admin').emit('adminNotification', notification);
    
    this.logger.log(`Broadcasted new notification: ${notification._id}`);
  }

  // Method to broadcast updated notification count to all connected clients
  private broadcastNotificationCount(count: number) {
    this.server.emit('notificationCount', { count });
    this.logger.log(`Broadcasted notification count: ${count}`);
  }

  // Method to send notifications to a specific client
  async sendNotificationsToClient(clientId: string) {
    try {
      const clientData = this.connectedClients.get(clientId);
      
      if (!clientData) {
        this.logger.warn(`Client ${clientId} not found`);
        return;
      }
      
      // Get all unread notifications
      const notifications = await this.chatNotificationsService.findUnread();
      
      // Send notifications to client
      clientData.socket.emit('notifications', notifications);
      
      // Get notification count
      const count = await this.chatNotificationsService.getCount();
      clientData.socket.emit('notificationCount', { count });
      
      this.logger.log(`Sent notifications to client ${clientId}`);
    } catch (error) {
      this.logger.error(`Error sending notifications to client: ${error.message}`);
    }
  }

  // Method to send notifications to all admin clients
  async sendNotificationsToAdmins() {
    try {
      // Get all unread notifications
      const notifications = await this.chatNotificationsService.findUnread();
      
      // Get notification count
      const count = await this.chatNotificationsService.getCount();
      
      // Send to all admin clients
      this.server.to('admin').emit('notifications', notifications);
      this.server.to('admin').emit('notificationCount', { count });
      
      this.logger.log(`Sent notifications to all admins`);
    } catch (error) {
      this.logger.error(`Error sending notifications to admins: ${error.message}`);
    }
  }

  // Method to notify admins about specific events
  async notifyAdminsAboutEvent(eventType: string, data: any) {
    try {
      this.server.to('admin').emit(eventType, data);
      this.logger.log(`Notified admins about event: ${eventType}`);
    } catch (error) {
      this.logger.error(`Error notifying admins about event: ${error.message}`);
    }
  }

  // Method to handle real-time notification for new chat messages
  async notifyNewChatMessage(chatId: string, message: string, sender: string, userData: any) {
    try {
      // Create notification in database
      const notification = await this.chatNotificationsService.create({
        type: 'chat_message',
        message: `New message from ${userData.fullName}`,
        data: { 
          chatId,
          message,
          sender,
          fullName: userData.fullName,
          email: userData.email
        },
        isRead: false
      });
      
      // Emit to admin room
      this.server.to('admin').emit('newChatMessage', {
        chatId,
        message,
        sender,
        fullName: userData.fullName,
        email: userData.email,
        timestamp: new Date(),
        notificationId: notification._id
      });
      
      // Get updated notification count
      const count = await this.chatNotificationsService.getCount();
      
      // Broadcast updated count to all clients
      this.broadcastNotificationCount(count);
      
      this.logger.log(`Notified admins about new chat message in chat ${chatId}`);
    } catch (error) {
      this.logger.error(`Error notifying about new chat message: ${error.message}`);
    }
  }

  // Method to handle real-time notification for new chats
  async notifyNewChat(chatId: string, userData: any) {
    try {
      // Create notification in database
      const notification = await this.chatNotificationsService.create({
        type: 'new_chat',
        message: `New chat from ${userData.fullName}`,
        data: { 
          chatId,
          fullName: userData.fullName,
          email: userData.email
        },
        isRead: false
      });
      
      // Emit to admin room
      this.server.to('admin').emit('newChat', {
        chatId,
        fullName: userData.fullName,
        email: userData.email,
        timestamp: new Date(),
        notificationId: notification._id
      });
      
      // Get updated notification count
      const count = await this.chatNotificationsService.getCount();
      
      // Broadcast updated count to all clients
      this.broadcastNotificationCount(count);
      
      this.logger.log(`Notified admins about new chat ${chatId}`);
    } catch (error) {
      this.logger.error(`Error notifying about new chat: ${error.message}`);
    }
  }
}