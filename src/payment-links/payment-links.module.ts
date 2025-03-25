import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { PaymentLinksService } from "./payment-links.service"
import { PaymentLinksController } from "./payment-links.controller"
import { PaymentLink, PaymentLinkSchema } from "./schemas/payment-link.schema"
import { TransactionsModule } from "../transactions/transactions.module"
import { AuditModule } from "../audit/audit.module"
import { NotificationsModule } from "../notifications/notifications.module"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PaymentLink.name, schema: PaymentLinkSchema }]),
    TransactionsModule,
    AuditModule,
    NotificationsModule,
  ],
  controllers: [PaymentLinksController],
  providers: [PaymentLinksService],
  exports: [PaymentLinksService],
})
export class PaymentLinksModule {}

