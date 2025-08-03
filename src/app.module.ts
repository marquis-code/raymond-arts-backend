import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { MongooseModule } from "@nestjs/mongoose"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ScheduleModule } from "@nestjs/schedule"
import { ThrottlerModule } from "@nestjs/throttler"

import { UsersModule } from "./users/users.module"
import { MulterModule } from '@nestjs/platform-express';
import { ProductsModule } from "./products/products.module"
import { SalesModule } from "./sales/sales.module"
import { OrdersModule } from "./orders/orders.module"
import { InventoryModule } from "./inventory/inventory.module"
import { PaymentsModule } from "./payments/payments.module"
import { TransactionsModule } from "./transactions/transactions.module"
import { InvoicesModule } from "./invoices/invoices.module"
import { PaymentLinksModule } from "./payment-links/payment-links.module"
import { ContactsModule } from "./contacts/contacts.module"
import { NotificationsModule } from "./notifications/notifications.module"
import { AuditModule } from "./audit/audit.module"
import { CloudinaryModule } from "./cloudinary/cloudinary.module"
import { EmailModule } from "./email/email.module"
import { AuthModule } from "./auth/auth.module"
import { ImagesModule } from "./images/images.module"
import { UploadModule } from "./upload/upload.module"
import { ShippingTaxModule } from "./shipping-tax/shipping-tax.module"
import { CoursesModule } from './courses/courses.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { ChatModule } from './chat/chat.module';
import { ChatNotificationsModule } from './chat-notifications/chat-notifications.module';
import { CommissionModule } from "./commission/commission.module"
import { PromoSaleModule } from './promosale/promosale.module';
import { ReviewModule } from './review/review.module';
import { ContentModule } from './content/content.module';
import { OriginalsModule } from "./originals/originals.module"

@Module({
  imports: [
    // Configuration
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          email: {
            service: process.env.EMAIL_SERVICE,
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASSWORD,
            from: process.env.EMAIL_FROM,
          },
          frontend: {
            url: process.env.FRONTEND_URL,
          },
        }),
      ],
      envFilePath: '.env'
    }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),

    // Event emitter for handling events across modules
    EventEmitterModule.forRoot(),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get<number>("THROTTLE_TTL", 60),
        limit: config.get<number>("THROTTLE_LIMIT", 100),
      }),
    }),

    // Application modules
    UploadModule,
    ImagesModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    SalesModule,
    OrdersModule,
    InventoryModule,
    PaymentsModule,
    TransactionsModule,
    InvoicesModule,
    PaymentLinksModule,
    ContactsModule,
    NotificationsModule,
    AuditModule,
    CloudinaryModule,
    EmailModule,
    ShippingTaxModule,
    CoursesModule,
    EnquiriesModule,
    ChatModule,
    ChatNotificationsModule,
    CommissionModule,
    PromoSaleModule,
    ReviewModule,
    ContentModule,
    OriginalsModule
  ],
})
export class AppModule {}
