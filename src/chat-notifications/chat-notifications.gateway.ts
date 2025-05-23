import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatNotificationsService } from './chat-notifications.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatNotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatNotificationsService: ChatNotificationsService) {}

  async handleConnection(client: Socket) {
    // When an admin connects, send the unread notification count
    const count = await this.chatNotificationsService.getCount();
    client.emit('notificationCount', { count });
  }

  handleDisconnect() {
    // Handle disconnect if needed
  }

  // Method to be called from other services to emit notifications
  async emitNotification(notification: any) {
    // Emit to all connected clients
    this.server.emit('newNotification', notification);
    
    // Update notification count
    const count = await this.chatNotificationsService.getCount();
    this.server.emit('notificationCount', { count });
  }
}