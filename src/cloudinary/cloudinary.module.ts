// // import { Module } from "@nestjs/common"
// // import { CloudinaryService } from "./cloudinary.service"
// // import { CloudinaryProvider } from "./cloudinary.provider"
// // import { CloudinaryController } from "./cloudinary.controller"

// // @Module({
// //   providers: [CloudinaryProvider, CloudinaryService],
// //   exports: [CloudinaryProvider, CloudinaryService],
// //   controllers: [CloudinaryController],
// // })
// // export class CloudinaryModule {}



// import { Module, Global } from "@nestjs/common"
// import { CloudinaryService } from "./cloudinary.service"
// import { CloudinaryProvider } from "./cloudinary.provider"
// import { CloudinaryController } from "./cloudinary.controller"

// @Global() // Make this module global
// @Module({
//   providers: [CloudinaryProvider, CloudinaryService],
//   exports: [CloudinaryProvider, CloudinaryService],
//   controllers: [CloudinaryController],
// })
// export class CloudinaryModule {}


// import { Module } from '@nestjs/common';
// import { CloudinaryService } from './cloudinary.service';
// import { CloudinaryController } from './cloudinary.controller';
// import { CloudinaryProvider } from './cloudinary.provider';
// import { ConfigModule } from '@nestjs/config';

// @Module({
//   imports: [ConfigModule],
//   controllers: [CloudinaryController],
//   providers: [CloudinaryProvider, CloudinaryService],
//   exports: [CloudinaryService],
// })
// export class CloudinaryModule {}

// src/cloudinary/cloudinary.module.ts
import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';

@Module({
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}