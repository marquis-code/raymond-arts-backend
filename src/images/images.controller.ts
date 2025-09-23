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
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ImagesService } from "./images.service";
import { CreateImageDto } from "./dto/create-image.dto";
import { UpdateImageDto } from "./dto/update-image.dto";
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";

// Custom image validator
const imageFileValidator = {
  isValid: (file: Express.Multer.File): boolean => {
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/webp',
      'image/svg+xml',
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/avif',
      'image/heic',
      'image/heif'
    ];
    
    const allowedExtensions = [
      '.png', '.jpeg', '.jpg', '.gif', '.bmp', 
      '.tiff', '.tif', '.webp', '.svg', '.ico', 
      '.avif', '.heic', '.heif'
    ];
    
    const mimeTypeValid = allowedMimeTypes.includes(file.mimetype);
    const extensionValid = allowedExtensions.some(ext => 
      file.originalname.toLowerCase().endsWith(ext)
    );
    
    return mimeTypeValid || extensionValid;
  },
  buildErrorMessage: (): string => {
    return 'File must be an image (png, jpeg, jpg, gif, bmp, tiff, webp, svg, ico, avif, heic, heif)';
  }
};

@ApiTags("Images")
@Controller("images")
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post("upload")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ 
    summary: 'Upload a single image with automatic WebP conversion and size optimization',
    description: 'Uploads an image file, automatically converts to WebP format, optimizes file size, and saves to database. Only the file is required - metadata fields are optional.'
  })
  @ApiResponse({ status: 201, description: 'Image uploaded, optimized, and saved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid file or upload failed' })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Image file (required) - will be automatically converted to WebP and optimized"
        },
        name: { 
          type: "string", 
          description: "Custom image name (optional - defaults to original filename without extension)" 
        },
        description: { 
          type: "string", 
          description: "Image description (optional)" 
        },
        tags: { 
          type: "string", 
          description: "Comma-separated tags or JSON array string (optional)",
          example: "nature,landscape,mountains or [\"nature\",\"landscape\",\"mountains\"]"
        }
      },
      required: ["file"]
    },
  })
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Body() createImageDto?: CreateImageDto,
  ) {
    // Validate file
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 10MB');
    }
    
    // Check file type
    if (!imageFileValidator.isValid(file)) {
      throw new BadRequestException(imageFileValidator.buildErrorMessage());
    }
    
    return this.imagesService.uploadFile(file, createImageDto);
  }

  @Post("upload/batch")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor("files", 10)) // Allow up to 10 files
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ 
    summary: 'Upload multiple images with automatic WebP conversion and size optimization',
    description: 'Uploads multiple image files with automatic WebP conversion and size optimization. Processes each file individually.'
  })
  @ApiResponse({ status: 201, description: 'All images uploaded, optimized, and saved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid files or upload failed' })
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
          description: "Multiple image files (required) - each will be automatically converted to WebP and optimized"
        },
        name: { 
          type: "string", 
          description: "Base name for images (optional - will be appended with _1, _2, etc.)" 
        },
        description: { 
          type: "string", 
          description: "Description applied to all images (optional)" 
        },
        tags: { 
          type: "string", 
          description: "Tags applied to all images - comma-separated or JSON array string (optional)",
          example: "batch,upload,photos or [\"batch\",\"upload\",\"photos\"]"
        }
      },
      required: ["files"]
    },
  })
  async uploadFiles(
    @UploadedFiles()
    files: Express.Multer.File[],
    @Body() createImageDto?: CreateImageDto,
  ) {
    // Validate files
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    
    // Validate each file
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        throw new BadRequestException(`File ${file.originalname} exceeds 10MB limit`);
      }
      
      if (!imageFileValidator.isValid(file)) {
        throw new BadRequestException(`File ${file.originalname} is not a valid image type`);
      }
    }
    
    return this.imagesService.uploadFiles(files, createImageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all images from database' })
  @ApiResponse({ status: 200, description: 'Images retrieved successfully' })
  async findAll() {
    return this.imagesService.findAll();
  }

  @Get('optimized')
  @ApiOperation({ summary: 'Get all images with optimized URLs for different sizes' })
  @ApiResponse({ status: 200, description: 'Images with optimized URLs retrieved successfully' })
  async findAllOptimized() {
    return this.imagesService.findAllOptimized();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific image by ID' })
  @ApiResponse({ status: 200, description: 'Image retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async findOne(@Param('id') id: string) {
    return this.imagesService.findOne(id);
  }

  @Get(':id/optimized')
  @ApiOperation({ summary: 'Get optimized URLs for different sizes of a specific image' })
  @ApiResponse({ status: 200, description: 'Optimized URLs retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async getOptimizedUrls(@Param('id') id: string) {
    return this.imagesService.getOptimizedImageUrls(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: 'Update image metadata (name, description, tags only)' })
  @ApiResponse({ status: 200, description: 'Image metadata updated successfully' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  async update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
    return this.imagesService.update(id, updateImageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an image (removes from both database and Cloudinary)' })
  @ApiResponse({ status: 204, description: 'Image deleted successfully' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async remove(@Param('id') id: string) {
    return this.imagesService.remove(id);
  }

  @Delete('cloudinary/:publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete image from Cloudinary only (using public_id)' })
  @ApiResponse({ status: 204, description: 'Image file deleted from Cloudinary successfully' })
  @ApiResponse({ status: 400, description: 'Failed to delete file from Cloudinary' })
  async deleteFromCloudinary(@Param('publicId') publicId: string) {
    await this.imagesService.deleteFromCloudinary(publicId);
    return { message: 'File deleted from Cloudinary successfully' };
  }
}