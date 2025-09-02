// controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  Query,
} from "@nestjs/common"
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
import { CloudinaryService } from "./cloudinary.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/enums/user-role.enum"
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"

@ApiTags("Cloudinary")
@Controller("cloudinary")
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post("upload")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiQuery({ name: 'folder', required: false, description: 'Upload folder path' })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Image file (supports: JPG, JPEG, PNG, GIF, BMP, TIFF, WebP, SVG, ICO, AVIF, HEIC, HEIF)"
        },
      },
    },
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Query('folder') folder?: string) {
    if (!file) {
      throw new BadRequestException("No file uploaded")
    }

    try {
      return await this.cloudinaryService.uploadFile(file, folder || "art-store")
    } catch (error) {
      throw new BadRequestException(error.message || "Failed to upload image")
    }
  }

  @Post("upload-multiple")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor("files", 10)) // Allow up to 10 files
  @ApiConsumes("multipart/form-data")
  @ApiQuery({ name: 'folder', required: false, description: 'Upload folder path' })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
          description: "Multiple image files (supports: JPG, JPEG, PNG, GIF, BMP, TIFF, WebP, SVG, ICO, AVIF, HEIC, HEIF)"
        },
      },
    },
  })
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[], 
    @Query('folder') folder?: string
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException("No files uploaded")
    }

    try {
      // Upload all files to the same folder
      const uploadPromises = files.map(file => 
        this.cloudinaryService.uploadFile(file, folder || "art-store")
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new BadRequestException(error.message || "Failed to upload images")
    }
  }

  @Post("upload-webp")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiQuery({ name: 'folder', required: false, description: 'Upload folder path' })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Image file that will be converted to WebP format"
        },
      },
    },
  })
  async uploadAndConvertToWebP(@UploadedFile() file: Express.Multer.File, @Query('folder') folder?: string) {
    if (!file) {
      throw new BadRequestException("No file uploaded")
    }

    try {
      return await this.cloudinaryService.uploadAndConvertToWebP(file, folder || "art-store")
    } catch (error) {
      throw new BadRequestException(error.message || "Failed to upload and convert image to WebP")
    }
  }

  @Delete(':publicId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async deleteImage(@Param('publicId') publicId: string) {
    try {
      return await this.cloudinaryService.deleteFile(publicId);
    } catch (error) {
      throw new BadRequestException(error.message || "Failed to delete image")
    }
  }
}