// import {
//   Controller,
//   Post,
//   UseInterceptors,
//   UploadedFile,
//   Param,
//   Delete,
//   UseGuards,
//   BadRequestException,
// } from "@nestjs/common"
// import { FileInterceptor } from "@nestjs/platform-express"
// import { CloudinaryService } from "./cloudinary.service"
// import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
// import { RolesGuard } from "../auth/guards/roles.guard"
// import { Roles } from "../auth/decorators/roles.decorator"
// import { UserRole } from "../users/enums/user-role.enum"
// import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth } from "@nestjs/swagger"

// @ApiTags("Cloudinary")
// @Controller("cloudinary")
// export class CloudinaryController {
//   constructor(private readonly cloudinaryService: CloudinaryService) {}

//   @Post("upload/:folder?")
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(UserRole.ADMIN, UserRole.STAFF)
//   @ApiBearerAuth()
//   @UseInterceptors(FileInterceptor("file"))
//   @ApiConsumes("multipart/form-data")
//   @ApiBody({
//     schema: {
//       type: "object",
//       properties: {
//         file: {
//           type: "string",
//           format: "binary",
//         },
//       },
//     },
//   })
//   async uploadImage(@UploadedFile() file: Express.Multer.File, @Param('folder') folder?: string) {
//     if (!file) {
//       throw new BadRequestException("No file uploaded")
//     }

//     return this.cloudinaryService.uploadFile(file, folder || "art-store")
//   }

//   @Delete(':publicId')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(UserRole.ADMIN)
//   @ApiBearerAuth()
//   async deleteImage(@Param('publicId') publicId: string) {
//     return this.cloudinaryService.deleteFile(publicId);
//   }
// }

import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  Query,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
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
        },
      },
    },
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Query('folder') folder?: string) {
    if (!file) {
      throw new BadRequestException("No file uploaded")
    }

    return this.cloudinaryService.uploadFile(file, folder || "art-store")
  }

  @Delete(':publicId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async deleteImage(@Param('publicId') publicId: string) {
    return this.cloudinaryService.deleteFile(publicId);
  }
}