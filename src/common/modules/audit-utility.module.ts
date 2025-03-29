// import { Module } from "@nestjs/common"
// import { MongooseModule } from "@nestjs/mongoose"
// import { Audit, AuditSchema } from "../../audit/schemas/audit.schema"
// import { AuditService } from "../../audit/audit.service"

// /**
//  * This module provides the AuditService without creating circular dependencies
//  */
// @Module({
//   imports: [MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }])],
//   providers: [AuditService],
//   exports: [AuditService],
// })
// export class AuditUtilityModule {}


// import { Module } from "@nestjs/common"
// import { MongooseModule } from "@nestjs/mongoose"
// import { Audit, AuditSchema } from "../../audit/schemas/audit.schema"
// import { AuditService } from "../../audit/audit.service"

// /**
//  * This module provides the AuditService without creating circular dependencies
//  */
// @Module({
//   imports: [MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }])],
//   providers: [AuditService],
//   exports: [AuditService, MongooseModule], // Make sure to export both the service and the MongooseModule
// })
// export class AuditUtilityModule {}


import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { Audit, AuditSchema } from "../../audit/schemas/audit.schema"
import { AuditService } from "../../audit/audit.service"

/**
 * This module provides the AuditService without creating circular dependencies
 */
@Module({
  imports: [MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }])],
  providers: [AuditService],
  exports: [AuditService, MongooseModule], // Export both service and MongooseModule
})
export class AuditUtilityModule {}

