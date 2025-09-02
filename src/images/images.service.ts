// import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
// import { InjectModel } from "@nestjs/mongoose"
// import type { Model } from "mongoose"
// import { Image, type ImageDocument } from "./schemas/image.schema"
// import { UploadService } from "../upload/upload.service"
// import type { CreateImageDto } from "./dto/create-image.dto"
// import type { UpdateImageDto } from "./dto/update-image.dto"
// import type { Express } from "express"

// @Injectable()
// export class ImagesService {
//   private readonly supportedImageFormats = [
//     'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'ico', 'avif', 'heic', 'heif'
//   ];

//   constructor(
//     @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
//     private uploadService: UploadService,
//   ) {}

//   private validateImageFile(file: Express.Multer.File): void {
//     if (!file) {
//       throw new BadRequestException("File is required")
//     }

//     // Check if it's an image by mimetype
//     if (!file.mimetype.startsWith('image/')) {
//       throw new BadRequestException("Only image files are allowed")
//     }

//     // Extract file extension
//     const fileExtension = file.originalname?.split('.').pop()?.toLowerCase();
    
//     // Additional validation for supported formats
//     if (fileExtension && !this.supportedImageFormats.includes(fileExtension)) {
//       throw new BadRequestException(
//         `Unsupported image format. Supported formats: ${this.supportedImageFormats.join(', ')}`
//       )
//     }
//   }

//   async create(file: Express.Multer.File, createImageDto: CreateImageDto): Promise<Image> {
//     this.validateImageFile(file);

//     try {
//       const result = await this.uploadService.uploadFile(file)

//       const newImage = new this.imageModel({
//         name: createImageDto.name,
//         description: createImageDto.description,
//         tags: createImageDto.tags,
//         url: result.secure_url,
//         publicId: result.public_id,
//         size: result.bytes,
//         format: result.format,
//         width: result.width,
//         height: result.height,
//       })

//       return newImage.save()
//     } catch (error) {
//       throw new BadRequestException(error.message || "Failed to upload and save image")
//     }
//   }

//   async createMany(files: Express.Multer.File[], createImageDto: CreateImageDto): Promise<Image[]> {
//     // Validate all files first
//     files.forEach(file => this.validateImageFile(file));

//     try {
//       const uploadResults = await this.uploadService.uploadFiles(files)

//       const images = uploadResults.map((result, index) => {
//         return new this.imageModel({
//           name: `${createImageDto.name}-${index + 1}`,
//           description: createImageDto.description,
//           tags: createImageDto.tags,
//           url: result.secure_url,
//           publicId: result.public_id,
//           size: result.bytes,
//           format: result.format,
//           width: result.width,
//           height: result.height,
//         })
//       })

//       return this.imageModel.insertMany(images)
//     } catch (error) {
//       throw new BadRequestException(error.message || "Failed to upload and save images")
//     }
//   }

//   async createWebP(file: Express.Multer.File, createImageDto: CreateImageDto): Promise<Image> {
//     this.validateImageFile(file);

//     try {
//       // Assuming your UploadService has a method to convert to WebP
//       // If not, you'll need to add this method to your UploadService
//       const result = await this.uploadService.uploadFileAsWebP(file)

//       const newImage = new this.imageModel({
//         name: createImageDto.name,
//         description: createImageDto.description,
//         tags: createImageDto.tags,
//         url: result.secure_url,
//         publicId: result.public_id,
//         size: result.bytes,
//         format: 'webp', // Format is always WebP for this method
//         width: result.width,
//         height: result.height,
//       })

//       return newImage.save()
//     } catch (error) {
//       throw new BadRequestException(error.message || "Failed to upload and convert image to WebP")
//     }
//   }

//   async findAll(): Promise<Image[]> {
//     try {
//       return await this.imageModel.find().exec()
//     } catch (error) {
//       throw new BadRequestException("Failed to retrieve images")
//     }
//   }

//   async findOne(id: string): Promise<Image> {
//     try {
//       const image = await this.imageModel.findById(id).exec()
//       if (!image) {
//         throw new NotFoundException(`Image with ID ${id} not found`)
//       }
//       return image
//     } catch (error) {
//       if (error instanceof NotFoundException) {
//         throw error
//       }
//       throw new BadRequestException("Failed to retrieve image")
//     }
//   }

//   async update(id: string, updateImageDto: UpdateImageDto): Promise<Image> {
//     try {
//       const updatedImage = await this.imageModel.findByIdAndUpdate(id, updateImageDto, { new: true }).exec()

//       if (!updatedImage) {
//         throw new NotFoundException(`Image with ID ${id} not found`)
//       }

//       return updatedImage
//     } catch (error) {
//       if (error instanceof NotFoundException) {
//         throw error
//       }
//       throw new BadRequestException("Failed to update image")
//     }
//   }

//   async remove(id: string): Promise<void> {
//     try {
//       const image = await this.findOne(id)
      
//       // Delete from cloud storage first
//       await this.uploadService.deleteFile(image.publicId)
      
//       // Then delete from database
//       await this.imageModel.findByIdAndDelete(id).exec()
//     } catch (error) {
//       if (error instanceof NotFoundException) {
//         throw error
//       }
//       throw new BadRequestException("Failed to delete image")
//     }
//   }

//   // Additional helper methods for image management
//   async findByFormat(format: string): Promise<Image[]> {
//     return this.imageModel.find({ format }).exec()
//   }

//   async findByTags(tags: string[]): Promise<Image[]> {
//     return this.imageModel.find({ tags: { $in: tags } }).exec()
//   }

//   async updateImageUrl(id: string, newUrl: string): Promise<Image> {
//     return this.imageModel.findByIdAndUpdate(id, { url: newUrl }, { new: true }).exec()
//   }
// }


import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { Image, type ImageDocument } from "./schemas/image.schema"
import { UploadService } from "../upload/upload.service"
import type { CreateImageDto } from "./dto/create-image.dto"
import type { UpdateImageDto } from "./dto/update-image.dto"
import type { Express } from "express"
import { v2 as cloudinary } from "cloudinary"

@Injectable()
export class ImagesService {
  private readonly supportedImageFormats = [
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'ico', 'avif', 'heic', 'heif'
  ];

  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
    private uploadService: UploadService,
  ) {}

  private validateImageFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException("File is required")
    }

    // Check if it's an image by mimetype
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException("Only image files are allowed")
    }

    // Extract file extension
    const fileExtension = file.originalname?.split('.').pop()?.toLowerCase();
    
    // Additional validation for supported formats
    if (fileExtension && !this.supportedImageFormats.includes(fileExtension)) {
      throw new BadRequestException(
        `Unsupported image format. Supported formats: ${this.supportedImageFormats.join(', ')}`
      )
    }
  }

  async create(file: Express.Multer.File, createImageDto: CreateImageDto): Promise<Image> {
    this.validateImageFile(file);

    try {
      // Upload with web optimization
      const result = await this.uploadService.uploadFile(file, true) // true = optimize for web

      const newImage = new this.imageModel({
        name: createImageDto.name,
        description: createImageDto.description,
        tags: createImageDto.tags,
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height,
      })

      return newImage.save()
    } catch (error) {
      throw new BadRequestException(error.message || "Failed to upload and save image")
    }
  }

  async createMany(files: Express.Multer.File[], createImageDto: CreateImageDto): Promise<Image[]> {
    // Validate all files first
    files.forEach(file => this.validateImageFile(file));

    try {
      // Upload all files with web optimization
      const uploadResults = await this.uploadService.uploadFiles(files, true) // true = optimize for web

      const images = uploadResults.map((result, index) => {
        return new this.imageModel({
          name: `${createImageDto.name}-${index + 1}`,
          description: createImageDto.description,
          tags: createImageDto.tags,
          url: result.secure_url,
          publicId: result.public_id,
          size: result.bytes,
          format: result.format,
          width: result.width,
          height: result.height,
        })
      })

      return this.imageModel.insertMany(images)
    } catch (error) {
      throw new BadRequestException(error.message || "Failed to upload and save images")
    }
  }

  async createWebP(file: Express.Multer.File, createImageDto: CreateImageDto): Promise<Image> {
    this.validateImageFile(file);

    try {
      // Assuming your UploadService has a method to convert to WebP
      // If not, you'll need to add this method to your UploadService
      const result = await this.uploadService.uploadFileAsWebP(file)

      const newImage = new this.imageModel({
        name: createImageDto.name,
        description: createImageDto.description,
        tags: createImageDto.tags,
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
        format: 'webp', // Format is always WebP for this method
        width: result.width,
        height: result.height,
      })

      return newImage.save()
    } catch (error) {
      throw new BadRequestException(error.message || "Failed to upload and convert image to WebP")
    }
  }

  async findAll(): Promise<Image[]> {
    try {
      return await this.imageModel.find().exec()
    } catch (error) {
      throw new BadRequestException("Failed to retrieve images")
    }
  }

  async findOne(id: string): Promise<Image> {
    try {
      const image = await this.imageModel.findById(id).exec()
      if (!image) {
        throw new NotFoundException(`Image with ID ${id} not found`)
      }
      return image
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException("Failed to retrieve image")
    }
  }

  async update(id: string, updateImageDto: UpdateImageDto): Promise<Image> {
    try {
      const updatedImage = await this.imageModel.findByIdAndUpdate(id, updateImageDto, { new: true }).exec()

      if (!updatedImage) {
        throw new NotFoundException(`Image with ID ${id} not found`)
      }

      return updatedImage
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException("Failed to update image")
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const image = await this.findOne(id)
      
      // Delete from cloud storage first
      await this.uploadService.deleteFile(image.publicId)
      
      // Then delete from database
      await this.imageModel.findByIdAndDelete(id).exec()
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException("Failed to delete image")
    }
  }

  // Method to get optimized image URLs for frontend
  async getOptimizedImageUrls(id: string): Promise<{
    optimized: string;
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
  }> {
    const image = await this.findOne(id);
    
    // Generate optimized URLs directly using cloudinary.url
    const baseOptions = {
      fetch_format: "auto",
      quality: "auto:good",
      dpr: "auto",
      flags: "progressive"
    };

    return {
      optimized: cloudinary.url(image.publicId, baseOptions),
      thumbnail: cloudinary.url(image.publicId, { ...baseOptions, width: 150, height: 150, crop: "fill" }),
      small: cloudinary.url(image.publicId, { ...baseOptions, width: 400, crop: "scale" }),
      medium: cloudinary.url(image.publicId, { ...baseOptions, width: 800, crop: "scale" }),
      large: cloudinary.url(image.publicId, { ...baseOptions, width: 1200, crop: "scale" })
    };
  }

  // Override findAll to return optimized URLs
  async findAllOptimized(): Promise<any[]> {
    const images = await this.imageModel.find().exec();
    
    return images.map((image) => {
      // Generate optimized URL directly
      const optimizedUrl = cloudinary.url(image.publicId, {
        fetch_format: "auto",
        quality: "auto:good",
        dpr: "auto",
        flags: "progressive"
      });
      
      return {
        ...image.toObject(),
        optimizedUrl, // Add optimized URL for frontend use
      };
    });
  }
}