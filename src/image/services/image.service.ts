// import { 
//   Injectable, 
//   NotFoundException, 
//   BadRequestException,
//   Logger,
//   InternalServerErrorException 
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Image, ImageDocument } from '../schemas/image.schema';
// import { CloudinaryService } from './cloudinary.service';
// import { UpdateImageDto } from '../dto/update-image.dto';
// import { UploadImageDto } from '../dto/upload-image.dto'
// import { PaginatedImagesResponseDto } from '../dto/image-response.dto';

// @Injectable()
// export class ImageService {
//   private readonly logger = new Logger(ImageService.name);

//   constructor(
//     @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
//     private cloudinaryService: CloudinaryService,
//   ) {}

//   async uploadSingleImage(
//     file: Express.Multer.File,
//   ): Promise<Image> {
//     this.validateFile(file);

//     try {
//       // Upload to Cloudinary with default settings
//       const cloudinaryResult = await this.cloudinaryService.uploadImageBuffer(
//         file.buffer,
//         'uploads' // Default folder
//       );

//       // Save to MongoDB with default values
//       const imageData = new this.imageModel({
//         filename: file.filename || `${Date.now()}-${file.originalname}`,
//         originalName: file.originalname,
//         cloudinaryUrl: cloudinaryResult.url,
//         cloudinaryPublicId: cloudinaryResult.public_id,
//         secureUrl: cloudinaryResult.secure_url,
//         format: cloudinaryResult.format,
//         width: cloudinaryResult.width,
//         height: cloudinaryResult.height,
//         bytes: cloudinaryResult.bytes,
//         folder: cloudinaryResult.folder,
//         resourceType: cloudinaryResult.resource_type,
//         tags: [], // Default empty array
//         description: '', // Default empty string
//       });

//       const savedImage = await imageData.save();
//       this.logger.log(`Image saved to database: ${savedImage.id}`);
//       return savedImage;
//     } catch (error) {
//       this.logger.error(`Failed to upload image: ${error.message}`, error.stack);
//       throw new InternalServerErrorException(`Failed to upload image: ${error.message}`);
//     }
//   }

//   async uploadMultipleImages(
//     files: Express.Multer.File[]
//   ): Promise<Image[]> {
//     if (!files || files.length === 0) {
//       throw new BadRequestException('No files provided');
//     }

//     if (files.length > 10) {
//       throw new BadRequestException('Maximum 10 files allowed per upload');
//     }

//     // Validate all files first
//     files.forEach(file => this.validateFile(file));

//     const uploadPromises = files.map(file => 
//       this.uploadSingleImage(file)
//     );

//     try {
//       const results = await Promise.allSettled(uploadPromises);
//       const successful = results
//         .filter((result): result is PromiseFulfilledResult<Image> => result.status === 'fulfilled')
//         .map(result => result.value);

//       const failed = results
//         .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
//         .map(result => result.reason);

//       if (failed.length > 0) {
//         this.logger.warn(`Some uploads failed: ${failed.length}/${files.length}`);
//       }

//       return successful;
//     } catch (error) {
//       this.logger.error(`Failed to upload multiple images: ${error.message}`, error.stack);
//       throw new InternalServerErrorException(`Failed to upload images: ${error.message}`);
//     }
//   }

//   async findAllImages(
//     page: number = 1, 
//     limit: number = 10,
//     tags?: string[]
//   ): Promise<PaginatedImagesResponseDto> {
//     const skip = (page - 1) * limit;
//     const query: any = { isActive: true };

//     if (tags && tags.length > 0) {
//       query.tags = { $in: tags };
//     }

//     try {
//       const [images, total] = await Promise.all([
//         this.imageModel
//           .find(query)
//           .skip(skip)
//           .limit(limit)
//           .sort({ createdAt: -1 })
//           .lean() // Add lean() to get plain objects instead of Mongoose documents
//           .exec(),
//         this.imageModel.countDocuments(query).exec(),
//       ]);

//       const totalPages = Math.ceil(total / limit);

//       return {
//         images: images.map(image => ({
//           ...image,
//           id: image._id?.toString(),
//           _id: undefined, // Remove _id from response
//           __v: undefined, // Remove __v from response
//         })) as any[],
//         total,
//         page,
//         totalPages,
//         hasNext: page < totalPages,
//         hasPrev: page > 1,
//       };
//     } catch (error) {
//       this.logger.error(`Failed to fetch images: ${error.message}`, error.stack);
//       throw new InternalServerErrorException('Failed to fetch images');
//     }
//   }

//   async findImageById(id: string): Promise<Image> {
//     try {
//       const image = await this.imageModel
//         .findOne({ _id: id, isActive: true })
//         .lean() // Add lean() for plain object
//         .exec();
      
//       if (!image) {
//         throw new NotFoundException(`Image with ID ${id} not found`);
//       }
      
//       // Transform the response
//       const transformedImage = {
//         ...image,
//         id: image._id?.toString(),
//         _id: undefined,
//         __v: undefined,
//       };
      
//       return transformedImage as any;
//     } catch (error) {
//       if (error instanceof NotFoundException) {
//         throw error;
//       }
//       this.logger.error(`Failed to find image by ID: ${error.message}`, error.stack);
//       throw new InternalServerErrorException('Failed to find image');
//     }
//   }

//   async updateImageMetadata(id: string, updateDto: UpdateImageDto): Promise<Image> {
//     try {
//       const image = await this.imageModel
//         .findOneAndUpdate(
//           { _id: id, isActive: true },
//           updateDto,
//           { new: true, runValidators: true }
//         )
//         .exec();
      
//       if (!image) {
//         throw new NotFoundException(`Image with ID ${id} not found`);
//       }
      
//       this.logger.log(`Image metadata updated: ${id}`);
//       return image;
//     } catch (error) {
//       if (error instanceof NotFoundException) {
//         throw error;
//       }
//       this.logger.error(`Failed to update image metadata: ${error.message}`, error.stack);
//       throw new InternalServerErrorException('Failed to update image');
//     }
//   }

//   async deleteImage(id: string): Promise<{ message: string }> {
//     const image = await this.findImageById(id);

//     try {
//       // Delete from Cloudinary
//       await this.cloudinaryService.deleteImage(image.cloudinaryPublicId);
      
//       // Soft delete from MongoDB
//       await this.imageModel
//         .findByIdAndUpdate(id, { isActive: false })
//         .exec();

//       this.logger.log(`Image deleted: ${id}`);
//       return { message: 'Image deleted successfully' };
//     } catch (error) {
//       this.logger.error(`Failed to delete image: ${error.message}`, error.stack);
//       throw new InternalServerErrorException(`Failed to delete image: ${error.message}`);
//     }
//   }

//   async findImagesByTags(tags: string[]): Promise<Image[]> {
//     try {
//       const images = await this.imageModel
//         .find({ 
//           tags: { $in: tags },
//           isActive: true 
//         })
//         .sort({ createdAt: -1 })
//         .lean() // Add lean() for plain objects
//         .exec();

//       // Transform the response
//       return images.map(image => ({
//         ...image,
//         id: image._id?.toString(),
//         _id: undefined,
//         __v: undefined,
//       })) as any[];
//     } catch (error) {
//       this.logger.error(`Failed to find images by tags: ${error.message}`, error.stack);
//       throw new InternalServerErrorException('Failed to find images by tags');
//     }
//   }

//   private validateFile(file: Express.Multer.File): void {
//     if (!file) {
//       throw new BadRequestException('No file provided');
//     }

//     // Validate file type
//     const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
//     if (!allowedMimeTypes.includes(file.mimetype)) {
//       throw new BadRequestException(
//         'Invalid file type. Only JPEG, PNG, JPG, and WebP are allowed.'
//       );
//     }

//     // Validate file size (5MB limit)
//     const maxSize = 5 * 1024 * 1024; // 5MB
//     if (file.size > maxSize) {
//       throw new BadRequestException('File size too large. Maximum size is 5MB.');
//     }
//   }
// }


import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  Logger,
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image, ImageDocument } from '../schemas/image.schema';
import { CloudinaryService } from './cloudinary.service';
import { UpdateImageDto } from '../dto/update-image.dto';
import { PaginatedImagesResponseDto } from '../dto/image-response.dto';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async uploadSingleImage(
    file: Express.Multer.File,
  ): Promise<Image> {
    this.validateFile(file);

    try {
      // Upload to Cloudinary with default settings
      const cloudinaryResult = await this.cloudinaryService.uploadImageBuffer(
        file.buffer,
        'uploads' // Default folder
      );

      // Save to MongoDB with default values
      const imageData = new this.imageModel({
        filename: file.filename || `${Date.now()}-${file.originalname}`,
        originalName: file.originalname,
        cloudinaryUrl: cloudinaryResult.url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        format: cloudinaryResult.format,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        bytes: cloudinaryResult.bytes,
        folder: cloudinaryResult.folder,
        resourceType: cloudinaryResult.resource_type,
        tags: [], // Default empty array
        description: '', // Default empty string
      });

      const savedImage = await imageData.save();
      this.logger.log(`Image saved to database: ${savedImage.id}`);
      return savedImage;
    } catch (error) {
      this.logger.error(`Failed to upload image: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
  ): Promise<Image[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 files allowed per upload');
    }

    // Validate all files first
    files.forEach(file => this.validateFile(file));

    const uploadPromises = files.map(file => 
      this.uploadSingleImage(file)
    );

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successful = results
        .filter((result): result is PromiseFulfilledResult<Image> => result.status === 'fulfilled')
        .map(result => result.value);

      const failed = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);

      if (failed.length > 0) {
        this.logger.warn(`Some uploads failed: ${failed.length}/${files.length}`);
      }

      return successful;
    } catch (error) {
      this.logger.error(`Failed to upload multiple images: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to upload images: ${error.message}`);
    }
  }

  async findAllImages(
    page: number = 1, 
    limit: number = 10,
    tags?: string[]
  ): Promise<PaginatedImagesResponseDto> {
    const skip = (page - 1) * limit;
    const query: any = { isActive: true };

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    try {
      const [images, total] = await Promise.all([
        this.imageModel
          .find(query)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean() // Add lean() to get plain objects instead of Mongoose documents
          .exec(),
        this.imageModel.countDocuments(query).exec(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        images: images.map(image => ({
          ...image,
          id: image._id?.toString(),
          _id: undefined, // Remove _id from response
          __v: undefined, // Remove __v from response
        })) as any[],
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch images: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch images');
    }
  }

  async findImageById(id: string): Promise<Image> {
    try {
      const image = await this.imageModel
        .findOne({ _id: id, isActive: true })
        .lean() // Add lean() for plain object
        .exec();
      
      if (!image) {
        throw new NotFoundException(`Image with ID ${id} not found`);
      }
      
      // Transform the response
      const transformedImage = {
        ...image,
        id: image._id?.toString(),
        _id: undefined,
        __v: undefined,
      };
      
      return transformedImage as any;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find image by ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to find image');
    }
  }

  async updateImageMetadata(id: string, updateDto: UpdateImageDto): Promise<Image> {
    try {
      const image = await this.imageModel
        .findOneAndUpdate(
          { _id: id, isActive: true },
          updateDto,
          { new: true, runValidators: true }
        )
        .exec();
      
      if (!image) {
        throw new NotFoundException(`Image with ID ${id} not found`);
      }
      
      this.logger.log(`Image metadata updated: ${id}`);
      return image;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update image metadata: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update image');
    }
  }

  async deleteImage(id: string): Promise<{ message: string }> {
    const image = await this.findImageById(id);

    try {
      // Delete from Cloudinary
      await this.cloudinaryService.deleteImage(image.cloudinaryPublicId);
      
      // Soft delete from MongoDB
      await this.imageModel
        .findByIdAndUpdate(id, { isActive: false })
        .exec();

      this.logger.log(`Image deleted: ${id}`);
      return { message: 'Image deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete image: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to delete image: ${error.message}`);
    }
  }

  async findImagesByTags(tags: string[]): Promise<Image[]> {
    try {
      const images = await this.imageModel
        .find({ 
          tags: { $in: tags },
          isActive: true 
        })
        .sort({ createdAt: -1 })
        .lean() // Add lean() for plain objects
        .exec();

      // Transform the response
      return images.map(image => ({
        ...image,
        id: image._id?.toString(),
        _id: undefined,
        __v: undefined,
      })) as any[];
    } catch (error) {
      this.logger.error(`Failed to find images by tags: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to find images by tags');
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, JPG, and WebP are allowed.'
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 5MB.');
    }
  }
}