import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { SalesService } from "./sales.service"
import { SalesController } from "./sales.controller"
import { Sale, SaleSchema } from "./schemas/sale.schema"
import { AuditUtilityModule } from "../common/modules/audit-utility.module"

@Module({
  imports: [MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }]), AuditUtilityModule],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}

