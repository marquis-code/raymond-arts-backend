

import { Module, forwardRef } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ScheduleModule } from "@nestjs/schedule"
import { InstallmentPlan, InstallmentPlanSchema } from "./schemas/installment-plan.schema"
import { InstallmentPayment, InstallmentPaymentSchema } from "./schemas/installment-payment.schema"
import { InstallmentAgreement, InstallmentAgreementSchema } from "./schemas/installment-agreement.schema"
import { Product, ProductSchema } from "../products/schemas/product.schema"
import { Order, OrderSchema } from "../orders/schemas/order.schema"
import { InstallmentPlanService } from "./services/installment-plan.service"
import { InstallmentPaymentService } from "./services/installment-payment.service"
import { InstallmentsService } from "../installments/installments.service"
import { InstallmentPlanController } from "./controllers/installment-plan.controller"
import { InstallmentPaymentController } from "./controllers/installment-payment.controller"
import { EmailModule } from "../email/email.module"
import { NotificationsModule } from "../notifications/notifications.module"
import { AuditModule } from "../audit/audit.module"
import { UsersModule } from "../users/users.module"
import { TransactionsModule } from "../transactions/transactions.module"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InstallmentPlan.name, schema: InstallmentPlanSchema },
      { name: InstallmentPayment.name, schema: InstallmentPaymentSchema },
      { name: InstallmentAgreement.name, schema: InstallmentAgreementSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    ScheduleModule.forRoot(),
    EmailModule,
    NotificationsModule,
    AuditModule,
    UsersModule,
    forwardRef(() => TransactionsModule),
  ],
  controllers: [InstallmentPlanController, InstallmentPaymentController],
  providers: [InstallmentPlanService, InstallmentPaymentService, InstallmentsService],
  exports: [InstallmentPlanService, InstallmentPaymentService, InstallmentsService],
})
export class InstallmentsModule {}