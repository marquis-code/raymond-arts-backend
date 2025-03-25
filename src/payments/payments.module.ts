import { Module } from "@nestjs/common"
import { PaymentsService } from "./payments.service"
import { PaymentsController } from "./payments.controller"
import { ConfigModule } from "@nestjs/config"
import { TransactionsModule } from "../transactions/transactions.module"
import { OrdersModule } from "../orders/orders.module"
import { UsersModule } from "../users/users.module"
import { EmailModule } from "../email/email.module"
import { AuditModule } from "../audit/audit.module"
import { NotificationsModule } from "../notifications/notifications.module"

@Module({
  imports: [ConfigModule, TransactionsModule, OrdersModule, UsersModule, EmailModule, AuditModule, NotificationsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

