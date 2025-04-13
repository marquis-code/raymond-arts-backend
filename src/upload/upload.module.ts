import { Module } from "@nestjs/common"
import { UploadService } from "./upload.service"
import { UploadProvider } from "./upload.provider"

@Module({
  providers: [UploadProvider, UploadService],
  exports: [UploadProvider, UploadService],
})
export class UploadModule {}
