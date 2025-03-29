// import { Module } from "@nestjs/common"
// import { CloudinaryService } from "./cloudinary.service"
// import { CloudinaryProvider } from "./cloudinary.provider"
// import { CloudinaryController } from "./cloudinary.controller"

// @Module({
//   providers: [CloudinaryProvider, CloudinaryService],
//   exports: [CloudinaryProvider, CloudinaryService],
//   controllers: [CloudinaryController],
// })
// export class CloudinaryModule {}



import { Module, Global } from "@nestjs/common"
import { CloudinaryService } from "./cloudinary.service"
import { CloudinaryProvider } from "./cloudinary.provider"
import { CloudinaryController } from "./cloudinary.controller"

@Global() // Make this module global
@Module({
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
  controllers: [CloudinaryController],
})
export class CloudinaryModule {}

