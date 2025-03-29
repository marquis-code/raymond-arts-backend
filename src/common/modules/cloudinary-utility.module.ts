import { Module } from "@nestjs/common"
import { CloudinaryService } from "../../cloudinary/cloudinary.service"
import { CloudinaryProvider } from "../../cloudinary/cloudinary.provider"

/**
 * This module provides CloudinaryService without creating circular dependencies
 */
@Module({
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryUtilityModule {}

