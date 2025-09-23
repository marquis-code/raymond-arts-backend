// // // import {
// // //   Controller,
// // //   Get,
// // //   Post,
// // //   Body,
// // //   Patch,
// // //   Param,
// // //   Delete,
// // //   UseInterceptors,
// // //   UploadedFile,
// // //   UploadedFiles,
// // //   ParseFilePipe,
// // //   MaxFileSizeValidator,
// // //   FileTypeValidator,
// // // } from "@nestjs/common"
// // // import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
// // // import { ImagesService } from "./images.service"
// // // import type { CreateImageDto } from "./dto/create-image.dto"
// // // import type { UpdateImageDto } from "./dto/update-image.dto"
// // // import { ApiTags, ApiConsumes, ApiBody } from "@nestjs/swagger"

// // // @ApiTags("Images")
// // // @Controller("images")
// // // export class ImagesController {
// // //   constructor(private readonly imagesService: ImagesService) {}

// // //   @Post()
// // //   @UseInterceptors(FileInterceptor("file"))
// // //   @ApiConsumes("multipart/form-data")
// // //   @ApiBody({
// // //     schema: {
// // //       type: "object",
// // //       properties: {
// // //         file: {
// // //           type: "string",
// // //           format: "binary",
// // //           description: "Image file (supports: JPG, JPEG, PNG, GIF, BMP, TIFF, WebP, SVG, ICO, AVIF, HEIC, HEIF)"
// // //         },
// // //         name: { type: "string" },
// // //         description: { type: "string" },
// // //         tags: { type: "array", items: { type: "string" } }
// // //       },
// // //     },
// // //   })
// // //   async create(
// // //     @UploadedFile(
// // //       new ParseFilePipe({
// // //         validators: [
// // //           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // Increased to 10MB for higher quality images
// // //           new FileTypeValidator({ 
// // //             fileType: '.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)' 
// // //           }),
// // //         ],
// // //       }),
// // //     )
// // //     file: Express.Multer.File,
// // //     @Body() createImageDto: CreateImageDto,
// // //   ) {
// // //     return this.imagesService.create(file, createImageDto)
// // //   }

// // //   @Post("batch")
// // //   @UseInterceptors(FilesInterceptor("files", 10)) // Allow up to 10 files
// // //   @ApiConsumes("multipart/form-data")
// // //   @ApiBody({
// // //     schema: {
// // //       type: "object",
// // //       properties: {
// // //         files: {
// // //           type: "array",
// // //           items: {
// // //             type: "string",
// // //             format: "binary",
// // //           },
// // //           description: "Multiple image files (supports: JPG, JPEG, PNG, GIF, BMP, TIFF, WebP, SVG, ICO, AVIF, HEIC, HEIF)"
// // //         },
// // //         name: { type: "string" },
// // //         description: { type: "string" },
// // //         tags: { type: "array", items: { type: "string" } }
// // //       },
// // //     },
// // //   })
// // //   async createMany(
// // //     @UploadedFiles(
// // //       new ParseFilePipe({
// // //         validators: [
// // //           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB per file
// // //           new FileTypeValidator({ 
// // //             fileType: '.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)' 
// // //           }),
// // //         ],
// // //       }),
// // //     )
// // //     files: Express.Multer.File[],
// // //     @Body() createImageDto: CreateImageDto,
// // //   ) {
// // //     return this.imagesService.createMany(files, createImageDto)
// // //   }

// // //   @Post("upload-webp")
// // //   @UseInterceptors(FileInterceptor("file"))
// // //   @ApiConsumes("multipart/form-data")
// // //   @ApiBody({
// // //     schema: {
// // //       type: "object",
// // //       properties: {
// // //         file: {
// // //           type: "string",
// // //           format: "binary",
// // //           description: "Image file that will be converted to WebP format"
// // //         },
// // //         name: { type: "string" },
// // //         description: { type: "string" },
// // //         tags: { type: "array", items: { type: "string" } }
// // //       },
// // //     },
// // //   })
// // //   async createWebP(
// // //     @UploadedFile(
// // //       new ParseFilePipe({
// // //         validators: [
// // //           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
// // //           new FileTypeValidator({ 
// // //             fileType: '.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)' 
// // //           }),
// // //         ],
// // //       }),
// // //     )
// // //     file: Express.Multer.File,
// // //     @Body() createImageDto: CreateImageDto,
// // //   ) {
// // //     return this.imagesService.createWebP(file, createImageDto)
// // //   }

// // //   @Get()
// // //   findAll() {
// // //     return this.imagesService.findAll()
// // //   }

// // //   @Get('optimized')
// // //   findAllOptimized() {
// // //     return this.imagesService.findAllOptimized()
// // //   }

// // //   @Get(':id')
// // //   findOne(@Param('id') id: string) {
// // //     return this.imagesService.findOne(id);
// // //   }

// // //   @Get(':id/optimized')
// // //   getOptimizedUrls(@Param('id') id: string) {
// // //     return this.imagesService.getOptimizedImageUrls(id);
// // //   }

// // //   @Patch(":id")
// // //   update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
// // //     return this.imagesService.update(id, updateImageDto)
// // //   }

// // //   @Delete(':id')
// // //   remove(@Param('id') id: string) {
// // //     return this.imagesService.remove(id);
// // //   }
// // // }


// // // import {
// // //   Controller,
// // //   Get,
// // //   Post,
// // //   Body,
// // //   Patch,
// // //   Param,
// // //   Delete,
// // //   UseInterceptors,
// // //   UploadedFile,
// // //   UploadedFiles,
// // //   ParseFilePipe,
// // //   MaxFileSizeValidator,
// // //   FileTypeValidator,
// // //   HttpCode,
// // //   HttpStatus,
// // // } from "@nestjs/common"
// // // import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
// // // import { ImagesService } from "./images.service"
// // // import { CreateImageDto } from "./dto/create-image.dto"
// // // import { UpdateImageDto } from "./dto/update-image.dto"
// // // import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger"

// // // @ApiTags("Images")
// // // @Controller("images")
// // // export class ImagesController {
// // //   constructor(private readonly imagesService: ImagesService) {}

// // //   @Post()
// // //   @HttpCode(HttpStatus.CREATED)
// // //   @UseInterceptors(FileInterceptor("file"))
// // //   @ApiConsumes("multipart/form-data")
// // //   @ApiOperation({ summary: 'Upload a single image' })
// // //   @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
// // //   @ApiResponse({ status: 400, description: 'Bad request - invalid file or data' })
// // //   @ApiBody({
// // //     schema: {
// // //       type: "object",
// // //       properties: {
// // //         file: {
// // //           type: "string",
// // //           format: "binary",
// // //           description: "Image file (supports: JPG, JPEG, PNG, GIF, BMP, TIFF, WebP, SVG, ICO, AVIF, HEIC, HEIF)"
// // //         },
// // //         name: { type: "string", description: "Image name" },
// // //         description: { type: "string", description: "Image description" },
// // //         tags: { 
// // //           type: "string", 
// // //           description: "Comma-separated tags or JSON array string",
// // //           example: "tag1,tag2,tag3 or [\"tag1\",\"tag2\",\"tag3\"]"
// // //         }
// // //       },
// // //       required: ["file"]
// // //     },
// // //   })
// // //   async create(
// // //     @UploadedFile(
// // //       new ParseFilePipe({
// // //         validators: [
// // //           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // Increased to 10MB for higher quality images
// // //           new FileTypeValidator({ 
// // //             fileType: /\.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)$/i
// // //           }),
// // //         ],
// // //       }),
// // //     )
// // //     file: Express.Multer.File,
// // //     @Body() createImageDto: CreateImageDto,
// // //   ) {
// // //     return this.imagesService.create(file, createImageDto)
// // //   }

// // //   @Post("batch")
// // //   @HttpCode(HttpStatus.CREATED)
// // //   @UseInterceptors(FilesInterceptor("files", 10)) // Allow up to 10 files
// // //   @ApiConsumes("multipart/form-data")
// // //   @ApiOperation({ summary: 'Upload multiple images at once' })
// // //   @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
// // //   @ApiResponse({ status: 400, description: 'Bad request - invalid files or data' })
// // //   @ApiBody({
// // //     schema: {
// // //       type: "object",
// // //       properties: {
// // //         files: {
// // //           type: "array",
// // //           items: {
// // //             type: "string",
// // //             format: "binary",
// // //           },
// // //           description: "Multiple image files (supports: JPG, JPEG, PNG, GIF, BMP, TIFF, WebP, SVG, ICO, AVIF, HEIC, HEIF)"
// // //         },
// // //         name: { type: "string", description: "Base name for images" },
// // //         description: { type: "string", description: "Description for images" },
// // //         tags: { 
// // //           type: "string", 
// // //           description: "Comma-separated tags or JSON array string",
// // //           example: "tag1,tag2,tag3 or [\"tag1\",\"tag2\",\"tag3\"]"
// // //         }
// // //       },
// // //       required: ["files"]
// // //     },
// // //   })
// // //   async createMany(
// // //     @UploadedFiles(
// // //       new ParseFilePipe({
// // //         validators: [
// // //           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB per file
// // //           new FileTypeValidator({ 
// // //             fileType: /\.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)$/i
// // //           }),
// // //         ],
// // //       }),
// // //     )
// // //     files: Express.Multer.File[],
// // //     @Body() createImageDto: CreateImageDto,
// // //   ) {
// // //     return this.imagesService.createMany(files, createImageDto)
// // //   }

// // //   @Post("upload-webp")
// // //   @HttpCode(HttpStatus.CREATED)
// // //   @UseInterceptors(FileInterceptor("file"))
// // //   @ApiConsumes("multipart/form-data")
// // //   @ApiOperation({ summary: 'Upload image and convert to optimized WebP format' })
// // //   @ApiResponse({ status: 201, description: 'Image uploaded and converted to WebP successfully' })
// // //   @ApiResponse({ status: 400, description: 'Bad request - invalid file or conversion failed' })
// // //   @ApiBody({
// // //     schema: {
// // //       type: "object",
// // //       properties: {
// // //         file: {
// // //           type: "string",
// // //           format: "binary",
// // //           description: "Image file that will be converted to optimized WebP format"
// // //         },
// // //         name: { type: "string", description: "Image name" },
// // //         description: { type: "string", description: "Image description" },
// // //         tags: { 
// // //           type: "string", 
// // //           description: "Comma-separated tags or JSON array string",
// // //           example: "tag1,tag2,tag3 or [\"tag1\",\"tag2\",\"tag3\"]"
// // //         }
// // //       },
// // //       required: ["file"]
// // //     },
// // //   })
// // //   async createWebP(
// // //     @UploadedFile(
// // //       new ParseFilePipe({
// // //         validators: [
// // //           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
// // //           new FileTypeValidator({ 
// // //             fileType: /\.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)$/i
// // //           }),
// // //         ],
// // //       }),
// // //     )
// // //     file: Express.Multer.File,
// // //     @Body() createImageDto: CreateImageDto,
// // //   ) {
// // //     return this.imagesService.createWebP(file, createImageDto)
// // //   }

// // //   @Post("upload-extreme")
// // //   @HttpCode(HttpStatus.CREATED)
// // //   @UseInterceptors(FileInterceptor("file"))
// // //   @ApiConsumes("multipart/form-data")
// // //   @ApiOperation({ summary: 'Upload image with extreme compression for maximum size reduction' })
// // //   @ApiResponse({ status: 201, description: 'Image uploaded with extreme compression successfully' })
// // //   @ApiResponse({ status: 400, description: 'Bad request - invalid file or compression failed' })
// // //   @ApiBody({
// // //     schema: {
// // //       type: "object",
// // //       properties: {
// // //         file: {
// // //           type: "string",
// // //           format: "binary",
// // //           description: "Image file that will be extremely compressed"
// // //         },
// // //         name: { type: "string", description: "Image name" },
// // //         description: { type: "string", description: "Image description" },
// // //         tags: { 
// // //           type: "string", 
// // //           description: "Comma-separated tags or JSON array string",
// // //           example: "tag1,tag2,tag3 or [\"tag1\",\"tag2\",\"tag3\"]"
// // //         },
// // //         targetSizeKB: { 
// // //           type: "number", 
// // //           description: "Target file size in KB (optional)",
// // //           example: 50
// // //         }
// // //       },
// // //       required: ["file"]
// // //     },
// // //   })
// // //   async createWithExtremeCompression(
// // //     @UploadedFile(
// // //       new ParseFilePipe({
// // //         validators: [
// // //           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
// // //           new FileTypeValidator({ 
// // //             fileType: /\.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)$/i
// // //           }),
// // //         ],
// // //       }),
// // //     )
// // //     file: Express.Multer.File,
// // //     @Body() createImageDto: CreateImageDto & { targetSizeKB?: string },
// // //   ) {
// // //     const targetSizeKB = createImageDto.targetSizeKB ? parseInt(createImageDto.targetSizeKB, 10) : undefined;
// // //     return this.imagesService.createWithExtremeCompression(file, createImageDto, targetSizeKB)
// // //   }

// // //   @Get()
// // //   @ApiOperation({ summary: 'Get all images' })
// // //   @ApiResponse({ status: 200, description: 'Images retrieved successfully' })
// // //   findAll() {
// // //     return this.imagesService.findAll()
// // //   }

// // //   @Get('optimized')
// // //   @ApiOperation({ summary: 'Get all images with optimized URLs' })
// // //   @ApiResponse({ status: 200, description: 'Optimized images retrieved successfully' })
// // //   findAllOptimized() {
// // //     return this.imagesService.findAllOptimized()
// // //   }

// // //   @Get(':id')
// // //   @ApiOperation({ summary: 'Get a specific image by ID' })
// // //   @ApiResponse({ status: 200, description: 'Image retrieved successfully' })
// // //   @ApiResponse({ status: 404, description: 'Image not found' })
// // //   findOne(@Param('id') id: string) {
// // //     return this.imagesService.findOne(id);
// // //   }

// // //   @Get(':id/optimized')
// // //   @ApiOperation({ summary: 'Get optimized URLs for a specific image' })
// // //   @ApiResponse({ status: 200, description: 'Optimized URLs retrieved successfully' })
// // //   @ApiResponse({ status: 404, description: 'Image not found' })
// // //   getOptimizedUrls(@Param('id') id: string) {
// // //     return this.imagesService.getOptimizedImageUrls(id);
// // //   }

// // //   @Patch(":id")
// // //   @ApiOperation({ summary: 'Update image metadata' })
// // //   @ApiResponse({ status: 200, description: 'Image updated successfully' })
// // //   @ApiResponse({ status: 404, description: 'Image not found' })
// // //   @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
// // //   update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
// // //     return this.imagesService.update(id, updateImageDto)
// // //   }

// // //   @Delete(':id')
// // //   @HttpCode(HttpStatus.NO_CONTENT)
// // //   @ApiOperation({ summary: 'Delete an image' })
// // //   @ApiResponse({ status: 204, description: 'Image deleted successfully' })
// // //   @ApiResponse({ status: 404, description: 'Image not found' })
// // //   remove(@Param('id') id: string) {
// // //     return this.imagesService.remove(id);
// // //   }
// // // }


// // import {
// //   Controller,
// //   Get,
// //   Post,
// //   Body,
// //   Patch,
// //   Param,
// //   Delete,
// //   UseInterceptors,
// //   UploadedFile,
// //   UploadedFiles,
// //   ParseFilePipe,
// //   MaxFileSizeValidator,
// //   FileTypeValidator,
// //   HttpCode,
// //   HttpStatus,
// //   Query,
// // } from "@nestjs/common"
// // import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
// // import { ImagesService } from "./images.service"
// // import { CreateImageDto } from "./dto/create-image.dto"
// // import { UpdateImageDto } from "./dto/update-image.dto"
// // import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger"

// // @ApiTags("Images")
// // @Controller("images")
// // export class ImagesController {
// //   constructor(private readonly imagesService: ImagesService) {}

// //   @Post("upload")
// //   @HttpCode(HttpStatus.CREATED)
// //   @UseInterceptors(FileInterceptor("file"))
// //   @ApiConsumes("multipart/form-data")
// //   @ApiOperation({ summary: 'Upload a single image with optional web optimization' })
// //   @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
// //   @ApiResponse({ status: 400, description: 'Bad request - invalid file or data' })
// //   @ApiQuery({ 
// //     name: 'optimizeForWeb', 
// //     required: false, 
// //     type: Boolean, 
// //     description: 'Enable web optimization (size reduction)' 
// //   })
// //   @ApiBody({
// //     schema: {
// //       type: "object",
// //       properties: {
// //         file: {
// //           type: "string",
// //           format: "binary",
// //           description: "Image file (supports: JPG, JPEG, PNG, GIF, BMP, TIFF, WebP, SVG, ICO, AVIF, HEIC, HEIF)"
// //         },
// //         name: { type: "string", description: "Image name" },
// //         description: { type: "string", description: "Image description" },
// //         tags: { 
// //           type: "string", 
// //           description: "Comma-separated tags or JSON array string",
// //           example: "tag1,tag2,tag3 or [\"tag1\",\"tag2\",\"tag3\"]"
// //         }
// //       },
// //       required: ["file"]
// //     },
// //   })
// //   async uploadFile(
// //     @UploadedFile(
// //       new ParseFilePipe({
// //         validators: [
// //           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
// //           new FileTypeValidator({ 
// //             fileType: /\.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)$/i
// //           }),
// //         ],
// //       }),
// //     )
// //     file: Express.Multer.File,
// //     @Body() createImageDto: CreateImageDto,
// //     @Query('optimizeForWeb') optimizeForWeb?: string,
// //   ) {
// //     const optimize = optimizeForWeb === 'true';
// //     return this.imagesService.uploadFile(file, createImageDto, optimize)
// //   }

// //   @Post("upload/batch")
// //   @HttpCode(HttpStatus.CREATED)
// //   @UseInterceptors(FilesInterceptor("files", 10)) // Allow up to 10 files
// //   @ApiConsumes("multipart/form-data")
// //   @ApiOperation({ summary: 'Upload multiple images at once with optional web optimization' })
// //   @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
// //   @ApiResponse({ status: 400, description: 'Bad request - invalid files or data' })
// //   @ApiQuery({ 
// //     name: 'optimizeForWeb', 
// //     required: false, 
// //     type: Boolean, 
// //     description: 'Enable web optimization (size reduction) for all files' 
// //   })
// //   @ApiBody({
// //     schema: {
// //       type: "object",
// //       properties: {
// //         files: {
// //           type: "array",
// //           items: {
// //             type: "string",
// //             format: "binary",
// //           },
// //           description: "Multiple image files (supports: JPG, JPEG, PNG, GIF, BMP, TIFF, WebP, SVG, ICO, AVIF, HEIC, HEIF)"
// //         },
// //         name: { type: "string", description: "Base name for images" },
// //         description: { type: "string", description: "Description for images" },
// //         tags: { 
// //           type: "string", 
// //           description: "Comma-separated tags or JSON array string",
// //           example: "tag1,tag2,tag3 or [\"tag1\",\"tag2\",\"tag3\"]"
// //         }
// //       },
// //       required: ["files"]
// //     },
// //   })
// //   async uploadFiles(
// //     @UploadedFiles(
// //       new ParseFilePipe({
// //         validators: [
// //           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB per file
// //           new FileTypeValidator({ 
// //             fileType: /\.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)$/i
// //           }),
// //         ],
// //       }),
// //     )
// //     files: Express.Multer.File[],
// //     @Body() createImageDto: CreateImageDto,
// //     @Query('optimizeForWeb') optimizeForWeb?: string,
// //   ) {
// //     const optimize = optimizeForWeb === 'true';
// //     return this.imagesService.uploadFiles(files, createImageDto, optimize)
// //   }

// //   @Post("upload/webp")
// //   @HttpCode(HttpStatus.CREATED)
// //   @UseInterceptors(FileInterceptor("file"))
// //   @ApiConsumes("multipart/form-data")
// //   @ApiOperation({ summary: 'Upload image and force conversion to optimized WebP format with size reduction' })
// //   @ApiResponse({ status: 201, description: 'Image uploaded and converted to WebP successfully' })
// //   @ApiResponse({ status: 400, description: 'Bad request - invalid file or conversion failed' })
// //   @ApiBody({
// //     schema: {
// //       type: "object",
// //       properties: {
// //         file: {
// //           type: "string",
// //           format: "binary",
// //           description: "Image file that will be converted to optimized WebP format with forced size reduction"
// //         },
// //         name: { type: "string", description: "Image name" },
// //         description: { type: "string", description: "Image description" },
// //         tags: { 
// //           type: "string", 
// //           description: "Comma-separated tags or JSON array string",
// //           example: "tag1,tag2,tag3 or [\"tag1\",\"tag2\",\"tag3\"]"
// //         }
// //       },
// //       required: ["file"]
// //     },
// //   })
// //   async uploadFileAsWebP(
// //     @UploadedFile(
// //       new ParseFilePipe({
// //         validators: [
// //           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
// //           new FileTypeValidator({ 
// //             fileType: /\.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)$/i
// //           }),
// //         ],
// //       }),
// //     )
// //     file: Express.Multer.File,
// //     @Body() createImageDto: CreateImageDto,
// //   ) {
// //     return this.imagesService.uploadFileAsWebP(file, createImageDto)
// //   }

// //   @Post("upload/extreme")
// //   @HttpCode(HttpStatus.CREATED)
// //   @UseInterceptors(FileInterceptor("file"))
// //   @ApiConsumes("multipart/form-data")
// //   @ApiOperation({ summary: 'Upload image with extreme compression for maximum size reduction' })
// //   @ApiResponse({ status: 201, description: 'Image uploaded with extreme compression successfully' })
// //   @ApiResponse({ status: 400, description: 'Bad request - invalid file or compression failed' })
// //   @ApiQuery({ 
// //     name: 'targetSizeKB', 
// //     required: false, 
// //     type: Number, 
// //     description: 'Target file size in KB (optional, defaults to 70% size reduction)' 
// //   })
// //   @ApiBody({
// //     schema: {
// //       type: "object",
// //       properties: {
// //         file: {
// //           type: "string",
// //           format: "binary",
// //           description: "Image file that will be extremely compressed"
// //         },
// //         name: { type: "string", description: "Image name" },
// //         description: { type: "string", description: "Image description" },
// //         tags: { 
// //           type: "string", 
// //           description: "Comma-separated tags or JSON array string",
// //           example: "tag1,tag2,tag3 or [\"tag1\",\"tag2\",\"tag3\"]"
// //         }
// //       },
// //       required: ["file"]
// //     },
// //   })
// //   async uploadFileWithExtremeCompression(
// //     @UploadedFile(
// //       new ParseFilePipe({
// //         validators: [
// //           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
// //           new FileTypeValidator({ 
// //             fileType: /\.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)$/i
// //           }),
// //         ],
// //       }),
// //     )
// //     file: Express.Multer.File,
// //     @Body() createImageDto: CreateImageDto,
// //     @Query('targetSizeKB') targetSizeKB?: string,
// //   ) {
// //     const targetSize = targetSizeKB ? parseInt(targetSizeKB, 10) : undefined;
// //     return this.imagesService.uploadFileWithExtremeCompression(file, createImageDto, targetSize)
// //   }

// //   @Get()
// //   @ApiOperation({ summary: 'Get all images' })
// //   @ApiResponse({ status: 200, description: 'Images retrieved successfully' })
// //   findAll() {
// //     return this.imagesService.findAll()
// //   }

// //   @Get('optimized')
// //   @ApiOperation({ summary: 'Get all images with optimized URLs' })
// //   @ApiResponse({ status: 200, description: 'Optimized images retrieved successfully' })
// //   findAllOptimized() {
// //     return this.imagesService.findAllOptimized()
// //   }

// //   @Get(':id')
// //   @ApiOperation({ summary: 'Get a specific image by ID' })
// //   @ApiResponse({ status: 200, description: 'Image retrieved successfully' })
// //   @ApiResponse({ status: 404, description: 'Image not found' })
// //   findOne(@Param('id') id: string) {
// //     return this.imagesService.findOne(id);
// //   }

// //   @Get(':id/optimized')
// //   @ApiOperation({ summary: 'Get optimized URLs for a specific image' })
// //   @ApiResponse({ status: 200, description: 'Optimized URLs retrieved successfully' })
// //   @ApiResponse({ status: 404, description: 'Image not found' })
// //   getOptimizedUrls(@Param('id') id: string) {
// //     return this.imagesService.getOptimizedImageUrls(id);
// //   }

// //   @Patch(":id")
// //   @ApiOperation({ summary: 'Update image metadata' })
// //   @ApiResponse({ status: 200, description: 'Image updated successfully' })
// //   @ApiResponse({ status: 404, description: 'Image not found' })
// //   @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
// //   update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
// //     return this.imagesService.update(id, updateImageDto)
// //   }

// //   @Delete(':id')
// //   @HttpCode(HttpStatus.NO_CONTENT)
// //   @ApiOperation({ summary: 'Delete an image' })
// //   @ApiResponse({ status: 204, description: 'Image deleted successfully' })
// //   @ApiResponse({ status: 404, description: 'Image not found' })
// //   remove(@Param('id') id: string) {
// //     return this.imagesService.remove(id);
// //   }

// //   @Delete(':id/file')
// //   @HttpCode(HttpStatus.NO_CONTENT)
// //   @ApiOperation({ summary: 'Delete image file from Cloudinary' })
// //   @ApiResponse({ status: 204, description: 'Image file deleted successfully' })
// //   @ApiResponse({ status: 404, description: 'Image not found' })
// //   @ApiResponse({ status: 400, description: 'Failed to delete file' })
// //   deleteFile(@Param('id') id: string) {
// //     return this.imagesService.deleteFile(id);
// //   }
// // }


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
//   HttpCode,
//   HttpStatus,
//   Query,
// } from "@nestjs/common"
// import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
// import { ImagesService } from "./images.service"
// import { CreateImageDto } from "./dto/create-image.dto"
// import { UpdateImageDto } from "./dto/update-image.dto"
// import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger"

// @ApiTags("Images")
// @Controller("images")
// export class ImagesController {
//   constructor(private readonly imagesService: ImagesService) {}

//   @Post("upload")
//   @HttpCode(HttpStatus.CREATED)
//   @UseInterceptors(FileInterceptor("file"))
//   @ApiConsumes("multipart/form-data")
//   @ApiOperation({ summary: 'Upload a single image with optional web optimization' })
//   @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
//   @ApiResponse({ status: 400, description: 'Bad request - invalid file or data' })
//   @ApiQuery({ 
//     name: 'optimizeForWeb', 
//     required: false, 
//     type: Boolean, 
//     description: 'Enable web optimization (size reduction)' 
//   })
//   @ApiBody({
//     schema: {
//       type: "object",
//       properties: {
//         file: {
//           type: "string",
//           format: "binary",
//           description: "Image file (supports: JPG, JPEG, PNG, GIF, BMP, TIFF, WebP, SVG, ICO, AVIF, HEIC, HEIF)"
//         },
//         name: { type: "string", description: "Image name" },
//         description: { type: "string", description: "Image description" },
//         tags: { 
//           type: "string", 
//           description: "Comma-separated tags or JSON array string",
//           example: "tag1,tag2,tag3 or [\"tag1\",\"tag2\",\"tag3\"]"
//         }
//       },
//       required: ["file"]
//     },
//   })
//   async uploadFile(
//     @UploadedFile(
//       new ParseFilePipe({
//         validators: [
//           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
//           new FileTypeValidator({ 
//             fileType: /\.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)$/i
//           }),
//         ],
//       }),
//     )
//     file: Express.Multer.File,
//     @Body() createImageDto: CreateImageDto,
//     @Query('optimizeForWeb') optimizeForWeb?: string,
//   ) {
//     const optimize = optimizeForWeb === 'true';
//     // Your service method only takes 2 parameters: file and optimizeForWeb boolean
//     const uploadResult = await this.imagesService.uploadFile(file, optimize);
    
//     // If you need to save image metadata to database, you'll need to handle that separately
//     // or modify your service to accept the createImageDto as well
//     return {
//       cloudinaryResult: uploadResult,
//       metadata: createImageDto // Return the DTO for now
//     };
//   }

//   @Post("upload/batch")
//   @HttpCode(HttpStatus.CREATED)
//   @UseInterceptors(FilesInterceptor("files", 10)) // Allow up to 10 files
//   @ApiConsumes("multipart/form-data")
//   @ApiOperation({ summary: 'Upload multiple images at once with optional web optimization' })
//   @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
//   @ApiResponse({ status: 400, description: 'Bad request - invalid files or data' })
//   @ApiQuery({ 
//     name: 'optimizeForWeb', 
//     required: false, 
//     type: Boolean, 
//     description: 'Enable web optimization (size reduction) for all files' 
//   })
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
//         name: { type: "string", description: "Base name for images" },
//         description: { type: "string", description: "Description for images" },
//         tags: { 
//           type: "string", 
//           description: "Comma-separated tags or JSON array string",
//           example: "tag1,tag2,tag3 or [\"tag1\",\"tag2\",\"tag3\"]"
//         }
//       },
//       required: ["files"]
//     },
//   })
//   async uploadFiles(
//     @UploadedFiles(
//       new ParseFilePipe({
//         validators: [
//           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB per file
//           new FileTypeValidator({ 
//             fileType: /\.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)$/i
//           }),
//         ],
//       }),
//     )
//     files: Express.Multer.File[],
//     @Body() createImageDto: CreateImageDto,
//     @Query('optimizeForWeb') optimizeForWeb?: string,
//   ) {
//     const optimize = optimizeForWeb === 'true';
//     // Your service method only takes 2 parameters: files array and optimizeForWeb boolean
//     const uploadResults = await this.imagesService.uploadFiles(files, optimize);
    
//     return {
//       cloudinaryResults: uploadResults,
//       metadata: createImageDto // Return the DTO for now
//     };
//   }

//   @Post("upload/webp")
//   @HttpCode(HttpStatus.CREATED)
//   @UseInterceptors(FileInterceptor("file"))
//   @ApiConsumes("multipart/form-data")
//   @ApiOperation({ summary: 'Upload image and force conversion to optimized WebP format with size reduction' })
//   @ApiResponse({ status: 201, description: 'Image uploaded and converted to WebP successfully' })
//   @ApiResponse({ status: 400, description: 'Bad request - invalid file or conversion failed' })
//   @ApiBody({
//     schema: {
//       type: "object",
//       properties: {
//         file: {
//           type: "string",
//           format: "binary",
//           description: "Image file that will be converted to optimized WebP format with forced size reduction"
//         },
//         name: { type: "string", description: "Image name" },
//         description: { type: "string", description: "Image description" },
//         tags: { 
//           type: "string", 
//           description: "Comma-separated tags or JSON array string",
//           example: "tag1,tag2,tag3 or [\"tag1\",\"tag2\",\"tag3\"]"
//         }
//       },
//       required: ["file"]
//     },
//   })
//   async uploadFileAsWebP(
//     @UploadedFile(
//       new ParseFilePipe({
//         validators: [
//           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
//           new FileTypeValidator({ 
//             fileType: /\.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)$/i
//           }),
//         ],
//       }),
//     )
//     file: Express.Multer.File,
//     @Body() createImageDto: CreateImageDto,
//   ) {
//     // Your service method only takes 1 parameter: the file
//     const uploadResult = await this.imagesService.uploadFileAsWebP(file);
    
//     return {
//       cloudinaryResult: uploadResult,
//       metadata: createImageDto // Return the DTO for now
//     };
//   }

//   @Post("upload/extreme")
//   @HttpCode(HttpStatus.CREATED)
//   @UseInterceptors(FileInterceptor("file"))
//   @ApiConsumes("multipart/form-data")
//   @ApiOperation({ summary: 'Upload image with extreme compression for maximum size reduction' })
//   @ApiResponse({ status: 201, description: 'Image uploaded with extreme compression successfully' })
//   @ApiResponse({ status: 400, description: 'Bad request - invalid file or compression failed' })
//   @ApiQuery({ 
//     name: 'targetSizeKB', 
//     required: false, 
//     type: Number, 
//     description: 'Target file size in KB (optional, defaults to 70% size reduction)' 
//   })
//   @ApiBody({
//     schema: {
//       type: "object",
//       properties: {
//         file: {
//           type: "string",
//           format: "binary",
//           description: "Image file that will be extremely compressed"
//         },
//         name: { type: "string", description: "Image name" },
//         description: { type: "string", description: "Image description" },
//         tags: { 
//           type: "string", 
//           description: "Comma-separated tags or JSON array string",
//           example: "tag1,tag2,tag3 or [\"tag1\",\"tag2\",\"tag3\"]"
//         }
//       },
//       required: ["file"]
//     },
//   })
//   async uploadFileWithExtremeCompression(
//     @UploadedFile(
//       new ParseFilePipe({
//         validators: [
//           new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
//           new FileTypeValidator({ 
//             fileType: /\.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)$/i
//           }),
//         ],
//       }),
//     )
//     file: Express.Multer.File,
//     @Body() createImageDto: CreateImageDto,
//     @Query('targetSizeKB') targetSizeKB?: string,
//   ) {
//     const targetSize = targetSizeKB ? parseInt(targetSizeKB, 10) : undefined;
//     // Your service method takes 2 parameters: file and optional targetSizeKB number
//     const uploadResult = await this.imagesService.uploadFileWithExtremeCompression(file, targetSize);
    
//     return {
//       cloudinaryResult: uploadResult,
//       metadata: createImageDto // Return the DTO for now
//     };
//   }

//   // The following endpoints need corresponding methods in your ImagesService
//   // For now, I'll comment them out or provide placeholder implementations

//   @Delete(':publicId')
//   @HttpCode(HttpStatus.NO_CONTENT)
//   @ApiOperation({ summary: 'Delete an image file from Cloudinary using public_id' })
//   @ApiResponse({ status: 204, description: 'Image file deleted successfully' })
//   @ApiResponse({ status: 400, description: 'Failed to delete file' })
//   async deleteFile(@Param('publicId') publicId: string) {
//     // This method exists in your service
//     await this.imagesService.deleteFile(publicId);
//     return { message: 'File deleted successfully' };
//   }

//   // Commented out endpoints that don't have corresponding service methods
//   // You'll need to implement these in your ImagesService if you want them

//   // @Get()
//   // @ApiOperation({ summary: 'Get all images' })
//   // @ApiResponse({ status: 200, description: 'Images retrieved successfully' })
//   // findAll() {
//   //   return this.imagesService.findAll()
//   // }

//   // @Get('optimized')
//   // @ApiOperation({ summary: 'Get all images with optimized URLs' })
//   // @ApiResponse({ status: 200, description: 'Optimized images retrieved successfully' })
//   // findAllOptimized() {
//   //   return this.imagesService.findAllOptimized()
//   // }

//   // @Get(':id')
//   // @ApiOperation({ summary: 'Get a specific image by ID' })
//   // @ApiResponse({ status: 200, description: 'Image retrieved successfully' })
//   // @ApiResponse({ status: 404, description: 'Image not found' })
//   // findOne(@Param('id') id: string) {
//   //   return this.imagesService.findOne(id);
//   // }

//   // @Get(':id/optimized')
//   // @ApiOperation({ summary: 'Get optimized URLs for a specific image' })
//   // @ApiResponse({ status: 200, description: 'Optimized URLs retrieved successfully' })
//   // @ApiResponse({ status: 404, description: 'Image not found' })
//   // getOptimizedUrls(@Param('id') id: string) {
//   //   return this.imagesService.getOptimizedImageUrls(id);
//   // }

//   // @Patch(":id")
//   // @ApiOperation({ summary: 'Update image metadata' })
//   // @ApiResponse({ status: 200, description: 'Image updated successfully' })
//   // @ApiResponse({ status: 404, description: 'Image not found' })
//   // @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
//   // update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
//   //   return this.imagesService.update(id, updateImageDto)
//   // }

//   // @Delete(':id')
//   // @HttpCode(HttpStatus.NO_CONTENT)
//   // @ApiOperation({ summary: 'Delete an image' })
//   // @ApiResponse({ status: 204, description: 'Image deleted successfully' })
//   // @ApiResponse({ status: 404, description: 'Image not found' })
//   // remove(@Param('id') id: string) {
//   //   return this.imagesService.remove(id);
//   // }
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
  HttpCode,
  HttpStatus,
  Query,
} from "@nestjs/common"
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
import { ImagesService } from "./images.service"
import { CreateImageDto } from "./dto/create-image.dto"
import { UpdateImageDto } from "./dto/update-image.dto"
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger"

@ApiTags("Images")
@Controller("images")
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post("upload")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ 
    summary: 'Upload a single image - automatically converts to WebP and reduces size',
    description: 'Uploads an image with automatic WebP conversion and size optimization. Only requires a file - all other fields are optional.'
  })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully and saved to database' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid file or data' })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Image file (will be automatically converted to WebP and optimized)"
        },
        name: { 
          type: "string", 
          description: "Image name (optional - will use filename if not provided)" 
        },
        description: { 
          type: "string", 
          description: "Image description (optional)" 
        },
        tags: { 
          type: "string", 
          description: "Comma-separated tags or JSON array string (optional)",
          example: "tag1,tag2,tag3 or [\"tag1\",\"tag2\",\"tag3\"]"
        }
      },
      required: ["file"]
    },
  })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ 
            fileType: /\.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)$/i
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() createImageDto?: CreateImageDto,
  ) {
    // Main upload - always converts to WebP with size reduction and saves to DB
    return this.imagesService.uploadFile(file, createImageDto);
  }

  @Post("upload/batch")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor("files", 10)) // Allow up to 10 files
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ 
    summary: 'Upload multiple images - automatically converts to WebP and reduces size',
    description: 'Uploads multiple images with automatic WebP conversion and size optimization.'
  })
  @ApiResponse({ status: 201, description: 'Images uploaded successfully and saved to database' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid files or data' })
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
          description: "Multiple image files (will be automatically converted to WebP and optimized)"
        },
        name: { 
          type: "string", 
          description: "Base name for images (optional - will use filenames if not provided)" 
        },
        description: { 
          type: "string", 
          description: "Description for images (optional)" 
        },
        tags: { 
          type: "string", 
          description: "Comma-separated tags or JSON array string (optional)",
          example: "tag1,tag2,tag3 or [\"tag1\",\"tag2\",\"tag3\"]"
        }
      },
      required: ["files"]
    },
  })
  async uploadFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB per file
          new FileTypeValidator({ 
            fileType: /\.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)$/i
          }),
        ],
      }),
    )
    files: Express.Multer.File[],
    @Body() createImageDto?: CreateImageDto,
  ) {
    return this.imagesService.uploadFiles(files, createImageDto);
  }

  @Post("upload/webp")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ 
    summary: 'Upload image with WebP conversion (direct Cloudinary only)',
    description: 'Uploads and converts to WebP but only returns Cloudinary result (no database save unless DTO provided)'
  })
  @ApiResponse({ status: 201, description: 'Image uploaded and converted to WebP successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid file or conversion failed' })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Image file that will be converted to optimized WebP format"
        },
        name: { type: "string", description: "Image name (optional)" },
        description: { type: "string", description: "Image description (optional)" },
        tags: { 
          type: "string", 
          description: "Comma-separated tags or JSON array string (optional)",
          example: "tag1,tag2,tag3 or [\"tag1\",\"tag2\",\"tag3\"]"
        }
      },
      required: ["file"]
    },
  })
  async uploadFileAsWebP(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ 
            fileType: /\.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)$/i
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() createImageDto?: CreateImageDto,
  ) {
    return this.imagesService.uploadFileAsWebP(file, createImageDto);
  }

  @Post("upload/extreme")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ 
    summary: 'Upload image with extreme compression for maximum size reduction',
    description: 'Applies extreme compression techniques to achieve maximum file size reduction'
  })
  @ApiResponse({ status: 201, description: 'Image uploaded with extreme compression successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid file or compression failed' })
  @ApiQuery({ 
    name: 'targetSizeKB', 
    required: false, 
    type: Number, 
    description: 'Target file size in KB (optional, defaults to 70% size reduction)' 
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Image file that will be extremely compressed"
        },
        name: { type: "string", description: "Image name (optional)" },
        description: { type: "string", description: "Image description (optional)" },
        tags: { 
          type: "string", 
          description: "Comma-separated tags or JSON array string (optional)",
          example: "tag1,tag2,tag3 or [\"tag1\",\"tag2\",\"tag3\"]"
        }
      },
      required: ["file"]
    },
  })
  async uploadFileWithExtremeCompression(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ 
            fileType: /\.(png|jpeg|jpg|gif|bmp|tiff|webp|svg|ico|avif|heic|heif)$/i
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() createImageDto?: CreateImageDto,
    @Query('targetSizeKB') targetSizeKB?: string,
  ) {
    const targetSize = targetSizeKB ? parseInt(targetSizeKB, 10) : undefined;
    return this.imagesService.uploadFileWithExtremeCompression(file, targetSize, createImageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all images from database' })
  @ApiResponse({ status: 200, description: 'Images retrieved successfully' })
  findAll() {
    return this.imagesService.findAll();
  }

  @Get('optimized')
  @ApiOperation({ summary: 'Get all images with optimized URLs' })
  @ApiResponse({ status: 200, description: 'Optimized images retrieved successfully' })
  findAllOptimized() {
    return this.imagesService.findAllOptimized();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific image by ID' })
  @ApiResponse({ status: 200, description: 'Image retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  findOne(@Param('id') id: string) {
    return this.imagesService.findOne(id);
  }

  @Get(':id/optimized')
  @ApiOperation({ summary: 'Get optimized URLs for a specific image' })
  @ApiResponse({ status: 200, description: 'Optimized URLs retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  getOptimizedUrls(@Param('id') id: string) {
    return this.imagesService.getOptimizedImageUrls(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: 'Update image metadata' })
  @ApiResponse({ status: 200, description: 'Image updated successfully' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
    return this.imagesService.update(id, updateImageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an image (removes from both database and Cloudinary)' })
  @ApiResponse({ status: 204, description: 'Image deleted successfully' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  remove(@Param('id') id: string) {
    return this.imagesService.remove(id);
  }

  @Delete('file/:publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete image file from Cloudinary only (using public_id)' })
  @ApiResponse({ status: 204, description: 'Image file deleted successfully' })
  @ApiResponse({ status: 400, description: 'Failed to delete file' })
  async deleteFile(@Param('publicId') publicId: string) {
    await this.imagesService.deleteFile(publicId);
    return { message: 'File deleted successfully' };
  }
}