import { Module, forwardRef } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ScheduleModule } from "@nestjs/schedule"
import { InstallmentsController } from "./installments.controller"
import { InstallmentsService } from "./installments.service"
import { InstallmentPlan, InstallmentPlanSchema } from "./schemas/installment-plan.schema"
import { Order, OrderSchema } from "../orders/schemas/order.schema"
import { Product, ProductSchema } from "../products/schemas/product.schema"
import { UsersModule } from "../users/users.module"
import { EmailModule } from "../email/email.module"
import { AuditModule } from "../audit/audit.module"
import { NotificationsModule } from "../notifications/notifications.module"
import { TransactionsModule } from "../transactions/transactions.module"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InstallmentPlan.name, schema: InstallmentPlanSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    ScheduleModule.forRoot(),
    forwardRef(() => UsersModule),
    forwardRef(() => EmailModule),
    forwardRef(() => AuditModule),
    forwardRef(() => NotificationsModule),
    forwardRef(() => TransactionsModule),
  ],
  controllers: [InstallmentsController],
  providers: [InstallmentsService],
  exports: [InstallmentsService],
})
export class InstallmentsModule {}
