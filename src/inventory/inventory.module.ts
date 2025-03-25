import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { InventoryService } from "./inventory.service"
import { InventoryController } from "./inventory.controller"
import { Inventory, InventorySchema } from "./schemas/inventory.schema"
import { AuditModule } from "../audit/audit.module"

@Module({
  imports: [MongooseModule.forFeature([{ name: Inventory.name, schema: InventorySchema }]), AuditModule],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}

