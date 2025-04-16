import { Module, forwardRef } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { InvoicesService } from "./invoices.service"
import { InvoicesController } from "./invoices.controller"
import { Invoice, InvoiceSchema } from "./schemas/invoice.schema"
import { UsersModule } from "../users/users.module"
import { EmailModule } from "../email/email.module"
import { AuditModule } from "../audit/audit.module"
import { OrdersModule } from '../orders/orders.module';
import { NotificationsModule } from "../notifications/notifications.module"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    UsersModule,
    EmailModule,
    AuditModule,
    NotificationsModule,
    forwardRef(() => OrdersModule),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}

