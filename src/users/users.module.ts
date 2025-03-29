// // import { Module } from "@nestjs/common"
// // import { MongooseModule } from "@nestjs/mongoose"
// // import { UsersService } from "./users.service"
// // import { UsersController } from "./users.controller"
// // import { User, UserSchema } from "./schemas/user.schema"
// // import { CloudinaryModule } from "../cloudinary/cloudinary.module"
// // import { AuditModule } from "../audit/audit.module"

// // @Module({
// //   imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), CloudinaryModule, AuditModule],
// //   controllers: [UsersController],
// //   providers: [UsersService],
// //   exports: [UsersService],
// // })
// // export class UsersModule {}


// import { Module } from "@nestjs/common"
// import { MongooseModule } from "@nestjs/mongoose"
// import { UsersService } from "./users.service"
// import { UsersController } from "./users.controller"
// import { User, UserSchema } from "./schemas/user.schema"
// import { CloudinaryModule } from "../cloudinary/cloudinary.module"
// import { AuditUtilityModule } from "../common/modules/audit-utility.module"

// @Module({
//   imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), CloudinaryModule, AuditUtilityModule],
//   controllers: [UsersController],
//   providers: [UsersService],
//   exports: [UsersService],
// })
// export class UsersModule {}


import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { UsersService } from "./users.service"
import { UsersController } from "./users.controller"
import { User, UserSchema } from "./schemas/user.schema"
import { CloudinaryUtilityModule } from "../common/modules/cloudinary-utility.module"
import { AuditUtilityModule } from "../common/modules/audit-utility.module"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CloudinaryUtilityModule,
    AuditUtilityModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

