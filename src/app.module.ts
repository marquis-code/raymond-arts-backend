import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { MongooseModule } from "@nestjs/mongoose"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ScheduleModule } from "@nestjs/schedule"
import { ThrottlerModule } from "@nestjs/throttler"

import { UsersModule } from "./users/users.module"
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

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
    }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_URI"),
        useNewUrlParser: true,
        useUnifiedTopology: true,
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
        ttl: config.get("THROTTLE_TTL", 60),
        limit: config.get("THROTTLE_LIMIT", 100),
      }),
    }),

    // Application modules
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
  ],
})
export class AppModule {}

