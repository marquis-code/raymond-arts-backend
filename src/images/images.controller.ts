// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   UseInterceptors,
//   UploadedFile,
//   UploadedFiles,
//   ParseFilePipe,
//   MaxFileSizeValidator,
//   FileTypeValidator,
// } from "@nestjs/common"
// import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
// import { ImagesService } from "./images.service"
// import type { CreateImageDto } from "./dto/create-image.dto"
// import type { UpdateImageDto } from "./dto/update-image.dto"
// import { ApiTags, ApiConsumes, ApiBody } from "@nestjs/swagger"

// @ApiTags("Images")
// @Controller("images")
// export class ImagesController {
//   constructor(private readonly imagesService: ImagesService) {}

//   @Post()
//   @UseInterceptors(FileInterceptor("file"))
//   @ApiConsumes("multipart/form-data")
//   @ApiBody({
//     schema: {
//       type: "object",
//       properties: {
//         file: {
//           type: "string",
//           format: "binary",
//           description: "Image file (supports: JPG, JPEG, PNG, GIF, BMP, TIFF, WebP, SVG, ICO, AVIF, HEIC, HEIF)"
//         },
//         name: { type: "string" },
//         description: { type: "string" },
//         tags: { type: "array", items: { type: "string" } }
//       },
//     },
//   })
//   async create(
//     @UploadedFile(
//       new ParseFilePipe({
//         validators: [
//           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // Increased to 10MB for higher quality images
//           new FileTypeValidator({ 
//             fileType: '.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)' 
//           }),
//         ],
//       }),
//     )
//     file: Express.Multer.File,
//     @Body() createImageDto: CreateImageDto,
//   ) {
//     return this.imagesService.create(file, createImageDto)
//   }

//   @Post("batch")
//   @UseInterceptors(FilesInterceptor("files", 10)) // Allow up to 10 files
//   @ApiConsumes("multipart/form-data")
//   @ApiBody({
//     schema: {
//       type: "object",
//       properties: {
//         files: {
//           type: "array",
//           items: {
//             type: "string",
//             format: "binary",
//           },
//           description: "Multiple image files (supports: JPG, JPEG, PNG, GIF, BMP, TIFF, WebP, SVG, ICO, AVIF, HEIC, HEIF)"
//         },
//         name: { type: "string" },
//         description: { type: "string" },
//         tags: { type: "array", items: { type: "string" } }
//       },
//     },
//   })
//   async createMany(
//     @UploadedFiles(
//       new ParseFilePipe({
//         validators: [
//           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB per file
//           new FileTypeValidator({ 
//             fileType: '.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)' 
//           }),
//         ],
//       }),
//     )
//     files: Express.Multer.File[],
//     @Body() createImageDto: CreateImageDto,
//   ) {
//     return this.imagesService.createMany(files, createImageDto)
//   }

//   @Post("upload-webp")
//   @UseInterceptors(FileInterceptor("file"))
//   @ApiConsumes("multipart/form-data")
//   @ApiBody({
//     schema: {
//       type: "object",
//       properties: {
//         file: {
//           type: "string",
//           format: "binary",
//           description: "Image file that will be converted to WebP format"
//         },
//         name: { type: "string" },
//         description: { type: "string" },
//         tags: { type: "array", items: { type: "string" } }
//       },
//     },
//   })
//   async createWebP(
//     @UploadedFile(
//       new ParseFilePipe({
//         validators: [
//           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
//           new FileTypeValidator({ 
//             fileType: '.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)' 
//           }),
//         ],
//       }),
//     )
//     file: Express.Multer.File,
//     @Body() createImageDto: CreateImageDto,
//   ) {
//     return this.imagesService.createWebP(file, createImageDto)
//   }

//   @Get()
//   findAll() {
//     return this.imagesService.findAll()
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.imagesService.findOne(id);
//   }

//   @Patch(":id")
//   update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
//     return this.imagesService.update(id, updateImageDto)
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.imagesService.remove(id);
//   }
// }

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from "@nestjs/common"
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
import { ImagesService } from "./images.service"
import type { CreateImageDto } from "./dto/create-image.dto"
import type { UpdateImageDto } from "./dto/update-image.dto"
import { ApiTags, ApiConsumes, ApiBody } from "@nestjs/swagger"

@ApiTags("Images")
@Controller("images")
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Image file (supports: JPG, JPEG, PNG, GIF, BMP, TIFF, WebP, SVG, ICO, AVIF, HEIC, HEIF)"
        },
        name: { type: "string" },
        description: { type: "string" },
        tags: { type: "array", items: { type: "string" } }
      },
    },
  })
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // Increased to 10MB for higher quality images
          new FileTypeValidator({ 
            fileType: '.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)' 
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() createImageDto: CreateImageDto,
  ) {
    return this.imagesService.create(file, createImageDto)
  }

  @Post("batch")
  @UseInterceptors(FilesInterceptor("files", 10)) // Allow up to 10 files
  @ApiConsumes("multipart/form-data")
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
        name: { type: "string" },
        description: { type: "string" },
        tags: { type: "array", items: { type: "string" } }
      },
    },
  })
  async createMany(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB per file
          new FileTypeValidator({ 
            fileType: '.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)' 
          }),
        ],
      }),
    )
    files: Express.Multer.File[],
    @Body() createImageDto: CreateImageDto,
  ) {
    return this.imagesService.createMany(files, createImageDto)
  }

  @Post("upload-webp")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Image file that will be converted to WebP format"
        },
        name: { type: "string" },
        description: { type: "string" },
        tags: { type: "array", items: { type: "string" } }
      },
    },
  })
  async createWebP(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ 
            fileType: '.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)' 
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() createImageDto: CreateImageDto,
  ) {
    return this.imagesService.createWebP(file, createImageDto)
  }

  @Get()
  findAll() {
    return this.imagesService.findAll()
  }

  @Get('optimized')
  findAllOptimized() {
    return this.imagesService.findAllOptimized()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imagesService.findOne(id);
  }

  @Get(':id/optimized')
  getOptimizedUrls(@Param('id') id: string) {
    return this.imagesService.getOptimizedImageUrls(id);
  }

  @Patch(":id")
  update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
    return this.imagesService.update(id, updateImageDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imagesService.remove(id);
  }
}