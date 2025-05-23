import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatNotificationsController } from './chat-notifications.controller';
import { ChatNotificationsService } from './chat-notifications.service';
import { ChatNotificationsGateway } from './chat-notifications.gateway';
import { ChatNotification, ChatNotificationSchema } from './schemas/chat-notification.schema';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatNotification.name, schema: ChatNotificationSchema },
    ]),
    forwardRef(() => ChatModule)
  ],
  controllers: [ChatNotificationsController],
  providers: [ChatNotificationsService, ChatNotificationsGateway],
  exports: [ChatNotificationsService, ChatNotificationsGateway],
})
export class ChatNotificationsModule {}