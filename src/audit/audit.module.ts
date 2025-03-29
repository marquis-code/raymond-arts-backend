// import { Module } from "@nestjs/common"
// import { MongooseModule } from "@nestjs/mongoose"
// import { AuditService } from "./audit.service"
// import { AuditController } from "./audit.controller"
// import { Audit, AuditSchema } from "./schemas/audit.schema"

// @Module({
//   imports: [MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }])],
//   controllers: [AuditController],
//   providers: [AuditService],
//   exports: [AuditService],
// })
// export class AuditModule {}


// import { Module } from "@nestjs/common"
// import { MongooseModule } from "@nestjs/mongoose"
// import { AuditService } from "./audit.service"
// import { AuditController } from "./audit.controller"
// import { Audit, AuditSchema } from "./schemas/audit.schema"

// @Module({
//   imports: [MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }])],
//   controllers: [AuditController],
//   providers: [AuditService],
//   exports: [AuditService],
// })
// export class AuditModule {}


import { Module, Global } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { AuditService } from "./audit.service"
import { AuditController } from "./audit.controller"
import { Audit, AuditSchema } from "./schemas/audit.schema"

@Global() // Make this module global so its providers are available everywhere
@Module({
  imports: [MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }])],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService, MongooseModule],
})
export class AuditModule {}
