import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ImagesController } from "./images.controller"
import { ImagesService } from "./images.service"
import { Image, ImageSchema } from "./schemas/image.schema"
import { UploadModule } from "../upload/upload.module"

@Module({
  imports: [MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]), UploadModule],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
