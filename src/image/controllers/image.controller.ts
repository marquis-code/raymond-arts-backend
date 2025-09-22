// import {
//   Controller,
//   Post,
//   Get,
//   Delete,
//   Patch,
//   Body,
//   Param,
//   Query,
//   UseInterceptors,
//   UploadedFile,
//   UploadedFiles,
//   ParseIntPipe,
//   DefaultValuePipe,
//   BadRequestException,
//   ValidationPipe,
//   HttpStatus,
//   HttpCode,
// } from '@nestjs/common';
// import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
// import { ImageService } from '../services/image.service';
// import { UpdateImageDto } from '../dto/update-image.dto';

// @Controller('images')
// export class ImageController {
//   constructor(private readonly imageService: ImageService) {}

//   @Post('upload')
//   @HttpCode(HttpStatus.CREATED)
//   @UseInterceptors(FileInterceptor('file')) 
//   async uploadSingleImage(
//     @UploadedFile() file: Express.Multer.File,
//   ) {
//     return {
//       success: true,
//       message: 'Image uploaded successfully',
//       data: await this.imageService.uploadSingleImage(file),
//     };
//   }

//   @Post('upload-multiple')
//   @HttpCode(HttpStatus.CREATED)
//   @UseInterceptors(FilesInterceptor('files', 10)) // Changed from 'images' to 'files'
//   async uploadMultipleImages(
//     @UploadedFiles() files: Express.Multer.File[],
//   ) {
//     const results = await this.imageService.uploadMultipleImages(files);
//     return {
//       success: true,
//       message: `${results.length}/${files?.length || 0} images uploaded successfully`,
//       data: results,
//     };
//   }

//   @Get()
//   async getAllImages(
//     @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
//     @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
//     @Query('tags') tags?: string,
//   ) {
//     const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : undefined;
//     const result = await this.imageService.findAllImages(page, limit, tagArray);
    
//     return {
//       success: true,
//       message: 'Images fetched successfully',
//       data: result,
//     };
//   }

//   @Get('by-tags')
//   async getImagesByTags(@Query('tags') tags: string) {
//     if (!tags) {
//       throw new BadRequestException('Tags query parameter is required');
//     }
    
//     const tagArray = tags.split(',').map(tag => tag.trim());
//     const images = await this.imageService.findImagesByTags(tagArray);
    
//     return {
//       success: true,
//       message: 'Images fetched successfully',
//       data: images,
//     };
//   }

//   @Get(':id')
//   async getImageById(@Param('id') id: string) {
//     return {
//       success: true,
//       message: 'Image fetched successfully',
//       data: await this.imageService.findImageById(id),
//     };
//   }

//   @Patch(':id')
//   async updateImageMetadata(
//     @Param('id') id: string,
//     @Body(ValidationPipe) updateDto: UpdateImageDto,
//   ) {
//     return {
//       success: true,
//       message: 'Image metadata updated successfully',
//       data: await this.imageService.updateImageMetadata(id, updateDto),
//     };
//   }

//   @Delete(':id')
//   @HttpCode(HttpStatus.OK)
//   async deleteImage(@Param('id') id: string) {
//     const result = await this.imageService.deleteImage(id);
//     return {
//       success: true,
//       ...result,
//     };
//   }
// }


import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
  ValidationPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ImageService } from '../services/image.service';
import { UpdateImageDto } from '../dto/update-image.dto';

@Controller('art-images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, callback) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error('Invalid file type'), false);
      }
    },
  }))
  async uploadSingleImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    
    return {
      success: true,
      message: 'Image uploaded successfully',
      data: await this.imageService.uploadSingleImage(file),
    };
  }

  @Post('upload-multiple')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 10, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB per file
    },
    fileFilter: (req, file, callback) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error('Invalid file type'), false);
      }
    },
  }))
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    
    const results = await this.imageService.uploadMultipleImages(files);
    return {
      success: true,
      message: `${results.length}/${files?.length || 0} images uploaded successfully`,
      data: results,
    };
  }

  @Get()
  async getAllImages(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('tags') tags?: string,
  ) {
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : undefined;
    const result = await this.imageService.findAllImages(page, limit, tagArray);
    
    return {
      success: true,
      message: 'Images fetched successfully',
      data: result,
    };
  }

  @Get('by-tags')
  async getImagesByTags(@Query('tags') tags: string) {
    if (!tags) {
      throw new BadRequestException('Tags query parameter is required');
    }
    
    const tagArray = tags.split(',').map(tag => tag.trim());
    const images = await this.imageService.findImagesByTags(tagArray);
    
    return {
      success: true,
      message: 'Images fetched successfully',
      data: images,
    };
  }

  @Get(':id')
  async getImageById(@Param('id') id: string) {
    return {
      success: true,
      message: 'Image fetched successfully',
      data: await this.imageService.findImageById(id),
    };
  }

  @Patch(':id')
  async updateImageMetadata(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdateImageDto,
  ) {
    return {
      success: true,
      message: 'Image metadata updated successfully',
      data: await this.imageService.updateImageMetadata(id, updateDto),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteImage(@Param('id') id: string) {
    const result = await this.imageService.deleteImage(id);
    return {
      success: true,
      ...result,
    };
  }
}