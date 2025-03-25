import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { OrdersService } from "./orders.service"
import { OrdersController } from "./orders.controller"
import { Order, OrderSchema } from "./schemas/order.schema"
import { ProductsModule } from "../products/products.module"
import { InventoryModule } from "../inventory/inventory.module"
import { UsersModule } from "../users/users.module"
import { EmailModule } from "../email/email.module"
import { AuditModule } from "../audit/audit.module"
import { NotificationsModule } from "../notifications/notifications.module"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ProductsModule,
    InventoryModule,
    UsersModule,
    EmailModule,
    AuditModule,
    NotificationsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

