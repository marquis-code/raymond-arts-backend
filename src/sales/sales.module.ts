// import { Module } from "@nestjs/common"
// import { MongooseModule } from "@nestjs/mongoose"
// import { SalesService } from "./sales.service"
// import { SalesController } from "./sales.controller"
// import { Sale, SaleSchema } from "./schemas/sale.schema"
// import { AuditModule } from "../audit/audit.module"

// @Module({
//   imports: [MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }]), AuditModule],
//   controllers: [SalesController],
//   providers: [SalesService],
//   exports: [SalesService],
// })
// export class SalesModule {}


// import { Module, forwardRef } from "@nestjs/common"
// import { MongooseModule } from "@nestjs/mongoose"
// import { SalesService } from "./sales.service"
// import { SalesController } from "./sales.controller"
// import { Sale, SaleSchema } from "./schemas/sale.schema"
// import { AuditModule } from "../audit/audit.module"

// @Module({
//   imports: [
//     MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }]),
//     forwardRef(() => AuditModule), // Use forwardRef to break circular dependency if needed
//   ],
//   controllers: [SalesController],
//   providers: [SalesService],
//   exports: [SalesService],
// })
// export class SalesModule {}


// import { Module } from "@nestjs/common"
// import { MongooseModule } from "@nestjs/mongoose"
// import { SalesService } from "./sales.service"
// import { SalesController } from "./sales.controller"
// import { Sale, SaleSchema } from "./schemas/sale.schema"
// import { AuditUtilityModule } from "../common/modules/audit-utility.module"

// @Module({
//   imports: [MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }]), AuditUtilityModule],
//   controllers: [SalesController],
//   providers: [SalesService],
//   exports: [SalesService],
// })
// export class SalesModule {}

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

