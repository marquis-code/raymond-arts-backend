// import { Module, forwardRef } from "@nestjs/common"
// import { MongooseModule } from "@nestjs/mongoose"
// import { OrdersService } from "./orders.service"
// import { OrdersController } from "./orders.controller"
// import { Order, OrderSchema } from "./schemas/order.schema"
// import { ProductsModule } from "../products/products.module"
// import { InventoryModule } from "../inventory/inventory.module"
// import { UsersModule } from "../users/users.module"
// import { EmailModule } from "../email/email.module"
// import { AuditModule } from "../audit/audit.module"
// import { NotificationsModule } from "../notifications/notifications.module"
// import { InvoicesModule } from '../invoices/invoices.module';
// import { ShippingTaxModule } from '../shipping-tax/shipping-tax.module';
// import { PaymentsModule } from "../payments/payments.module"
// import { SalesModule } from "src/sales/sales.module"

// @Module({
//   imports: [
//     MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
//     ProductsModule,
//     InventoryModule,
//     UsersModule,
//     EmailModule,
//     AuditModule,
//     NotificationsModule,
//     InventoryModule,
//     forwardRef(() => PaymentsModule),
//     forwardRef(() => ShippingTaxModule),
//     forwardRef(() => InvoicesModule),
//     SalesModule
//   ],
//   controllers: [OrdersController],
//   providers: [OrdersService],
//   exports: [OrdersService],
// })
// export class OrdersModule {}


import { Module, forwardRef } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { OrdersService } from './orders.service'
import { OrdersController } from './orders.controller'
import { Order, OrderSchema } from './schemas/order.schema'
import { ProductsModule } from '../products/products.module'
import { InventoryModule } from '../inventory/inventory.module'
import { UsersModule } from '../users/users.module'
import { EmailModule } from '../email/email.module'
import { AuditModule } from '../audit/audit.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { InvoicesModule } from '../invoices/invoices.module'
import { ShippingTaxModule } from '../shipping-tax/shipping-tax.module'
import { InstallmentsModule } from '../installments/installments.module' // FIXED: Correct module name
import { PaymentsModule } from '../payments/payments.module'
import { SalesModule } from '../sales/sales.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ProductsModule,
    InventoryModule,
    UsersModule,
    EmailModule,
    AuditModule,
    NotificationsModule,
    InvoicesModule,
    ShippingTaxModule,
    InstallmentsModule, // FIXED: Correct module import
    forwardRef(() => PaymentsModule),
    SalesModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}