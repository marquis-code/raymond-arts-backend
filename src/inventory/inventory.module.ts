// import { Module, Global } from "@nestjs/common"
// import { MongooseModule } from "@nestjs/mongoose"
// import { InventoryService } from "./inventory.service"
// import { InventoryController } from "./inventory.controller"
// import { Inventory, InventorySchema } from "./schemas/inventory.schema"
// import { AuditModule } from "../audit/audit.module"

// @Global() // Make this module global since it's used in multiple places
// @Module({
//   imports: [MongooseModule.forFeature([{ name: Inventory.name, schema: InventorySchema }]), AuditModule],
//   controllers: [InventoryController],
//   providers: [InventoryService],
//   exports: [InventoryService, MongooseModule],
// })
// export class InventoryModule {}


import { Module, Global } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { InventoryService } from "./inventory.service"
import { InventoryController } from "./inventory.controller"
import { Inventory, InventorySchema } from "./schemas/inventory.schema"
import { AuditUtilityModule } from "../common/modules/audit-utility.module"

@Global() // Make this module global since it's used in multiple places
@Module({
  imports: [MongooseModule.forFeature([{ name: Inventory.name, schema: InventorySchema }]), AuditUtilityModule],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService, MongooseModule],
})
export class InventoryModule {}

