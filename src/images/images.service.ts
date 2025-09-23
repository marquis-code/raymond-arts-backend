import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { Image, ImageDocument } from './schemas/image.schema';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

@Injectable()
export class ImagesService {
  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
  ) {
    // Configure cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Main upload method - converts to WebP, optimizes size, and saves to database
   */
  async uploadFile(file: Express.Multer.File, createImageDto?: CreateImageDto): Promise<ImageDocument> {
    try {
      console.log(`🚀 Starting optimized upload for: ${file.originalname}`);
      console.log(`Original file size: ${(file.size / 1024).toFixed(1)} KB`);
      
      // Convert and optimize the image
      const { optimizedBuffer, compressionRatio } = await this.convertToOptimizedWebP(file.buffer, file.size);
      
      // Upload to Cloudinary
      const uploadResult = await this.uploadToCloudinary(optimizedBuffer, file.originalname);
      
      // Extract filename without extension for default name
      const nameWithoutExt = file.originalname.split('.').slice(0, -1).join('.');
      
      // Create image document in database
      const imageData = {
        name: createImageDto?.name || nameWithoutExt,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        description: createImageDto?.description || '',
        tags: createImageDto?.tags || [],
        size: uploadResult.bytes,
        format: 'webp',
        width: uploadResult.width,
        height: uploadResult.height,
        originalName: file.originalname,
        originalSize: file.size,
        compressionRatio,
      };

      const savedImage = new this.imageModel(imageData);
      await savedImage.save();

      console.log(`✅ Image saved to database with ID: ${savedImage._id}`);
      console.log(`Final compression: ${compressionRatio.toFixed(1)}% size reduction`);
      
      return savedImage;
    } catch (error) {
      console.error('Upload failed:', error);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Batch upload with WebP conversion
   */
  async uploadFiles(files: Express.Multer.File[], createImageDto?: CreateImageDto): Promise<ImageDocument[]> {
    console.log(`🚀 Starting batch upload for ${files.length} files`);
    
    const uploadPromises = files.map((file, index) => {
      const fileDto: CreateImageDto = {
        name: createImageDto?.name ? `${createImageDto.name}_${index + 1}` : undefined,
        description: createImageDto?.description,
        tags: createImageDto?.tags,
      };
      return this.uploadFile(file, fileDto);
    });
    
    try {
      const results = await Promise.all(uploadPromises);
      console.log(`✅ Successfully uploaded ${results.length} files`);
      return results;
    } catch (error) {
      console.error('Batch upload failed:', error);
      throw new BadRequestException(`Batch upload failed: ${error.message}`);
    }
  }

  /**
   * Database CRUD operations
   */
  async findAll(): Promise<ImageDocument[]> {
    return this.imageModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<ImageDocument> {
    const image = await this.imageModel.findById(id).exec();
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return image;
  }

  async update(id: string, updateImageDto: UpdateImageDto): Promise<ImageDocument> {
    const updatedImage = await this.imageModel
      .findByIdAndUpdate(id, updateImageDto, { new: true })
      .exec();

    if (!updatedImage) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return updatedImage;
  }

  async remove(id: string): Promise<void> {
    const image = await this.imageModel.findById(id).exec();
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    // Delete from Cloudinary first
    try {
      await this.deleteFromCloudinary(image.publicId);
      console.log(`🗑️ Deleted from Cloudinary: ${image.publicId}`);
    } catch (error) {
      console.warn(`Failed to delete from Cloudinary: ${error.message}`);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete from database
    await this.imageModel.findByIdAndDelete(id).exec();
    console.log(`🗑️ Deleted from database: ${id}`);
  }

  async deleteFromCloudinary(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result !== 'ok') {
        throw new Error(`Cloudinary deletion failed: ${result.result}`);
      }
    } catch (error) {
      throw new BadRequestException(`Failed to delete file from Cloudinary: ${error.message}`);
    }
  }

  /**
   * Get optimized image URLs with different sizes using Cloudinary transformations
   */
  async getOptimizedImageUrls(id: string): Promise<any> {
    const image = await this.findOne(id);
    
    const baseUrl = image.url.split('/upload/')[0] + '/upload/';
    const imagePath = image.url.split('/upload/')[1];
    
    return {
      original: image.url,
      thumbnail: `${baseUrl}w_200,h_200,c_fill,f_webp,q_auto/${imagePath}`,
      small: `${baseUrl}w_400,h_400,c_fit,f_webp,q_auto/${imagePath}`,
      medium: `${baseUrl}w_800,h_800,c_fit,f_webp,q_auto/${imagePath}`,
      large: `${baseUrl}w_1200,h_1200,c_fit,f_webp,q_auto/${imagePath}`,
      xlarge: `${baseUrl}w_1920,h_1920,c_fit,f_webp,q_auto/${imagePath}`,
    };
  }

  async findAllOptimized(): Promise<any[]> {
    const images = await this.findAll();
    return Promise.all(
      images.map(async (image) => ({
        ...image.toObject(),
        optimizedUrls: await this.getOptimizedImageUrls(image._id.toString()),
      }))
    );
  }

  /**
   * Convert image to optimized WebP format
   */
  private async convertToOptimizedWebP(inputBuffer: Buffer, originalSize: number): Promise<{ optimizedBuffer: Buffer, compressionRatio: number }> {
    console.log(`🎯 Converting to optimized WebP...`);
    
    try {
      // Get image metadata
      const metadata = await sharp(inputBuffer).metadata();
      console.log(`Image dimensions: ${metadata.width}x${metadata.height}`);
      console.log(`Original format: ${metadata.format}`);

      // If image is already very small, use gentle compression
      if (originalSize < 50 * 1024) { // Less than 50KB
        console.log('Small image detected, using gentle compression');
        return this.gentleWebPCompression(inputBuffer, originalSize);
      }

      // Target 60-70% of original size
      const targetSize = Math.floor(originalSize * 0.65);
      console.log(`Target size: ${(targetSize / 1024).toFixed(1)} KB`);

      // Progressive quality levels for optimization
      const qualityLevels = [85, 75, 65, 55, 45, 35, 25];
      
      for (const quality of qualityLevels) {
        const webpBuffer = await sharp(inputBuffer)
          .webp({
            quality,
            effort: 6, // Maximum compression effort
            smartSubsample: true,
            nearLossless: false,
          })
          .toBuffer();

        const compressionRatio = ((originalSize - webpBuffer.length) / originalSize) * 100;
        console.log(`WebP at ${quality}% quality: ${(webpBuffer.length / 1024).toFixed(1)} KB (${compressionRatio.toFixed(1)}% reduction)`);

        // Accept if we achieve good compression (at least 20% reduction) or hit target
        if (webpBuffer.length <= targetSize || compressionRatio >= 20) {
          console.log(`✅ Optimal compression achieved at ${quality}% quality`);
          return { optimizedBuffer: webpBuffer, compressionRatio };
        }
      }

      // If quality reduction isn't enough, try dimension reduction
      console.log('⚠️ Quality compression insufficient, trying dimension reduction...');
      return this.dimensionReduction(inputBuffer, originalSize, targetSize);
      
    } catch (error) {
      console.error('WebP conversion failed:', error);
      throw new InternalServerErrorException(`Image optimization failed: ${error.message}`);
    }
  }

  /**
   * Gentle compression for small images
   */
  private async gentleWebPCompression(inputBuffer: Buffer, originalSize: number): Promise<{ optimizedBuffer: Buffer, compressionRatio: number }> {
    const webpBuffer = await sharp(inputBuffer)
      .webp({
        quality: 90,
        effort: 4,
        smartSubsample: true,
      })
      .toBuffer();

    const compressionRatio = ((originalSize - webpBuffer.length) / originalSize) * 100;
    return { optimizedBuffer: webpBuffer, compressionRatio };
  }

  /**
   * Dimension reduction for larger images
   */
  private async dimensionReduction(inputBuffer: Buffer, originalSize: number, targetSize: number): Promise<{ optimizedBuffer: Buffer, compressionRatio: number }> {
    const metadata = await sharp(inputBuffer).metadata();
    const originalWidth = metadata.width || 1920;
    const originalHeight = metadata.height || 1080;
    
    console.log(`Trying dimension reduction from ${originalWidth}x${originalHeight}`);

    // Try different scaling factors
    const scaleFactors = [0.9, 0.8, 0.7, 0.6, 0.5];
    
    for (const scale of scaleFactors) {
      const newWidth = Math.floor(originalWidth * scale);
      const newHeight = Math.floor(originalHeight * scale);
      
      try {
        const resizedBuffer = await sharp(inputBuffer)
          .resize(newWidth, newHeight, {
            kernel: sharp.kernel.lanczos3,
            withoutEnlargement: true,
          })
          .webp({
            quality: 75,
            effort: 6,
            smartSubsample: true,
          })
          .toBuffer();

        const compressionRatio = ((originalSize - resizedBuffer.length) / originalSize) * 100;
        console.log(`${newWidth}x${newHeight}: ${(resizedBuffer.length / 1024).toFixed(1)} KB (${compressionRatio.toFixed(1)}% reduction)`);

        if (resizedBuffer.length <= targetSize || compressionRatio >= 30) {
          console.log(`✅ Dimension reduction successful at ${(scale * 100).toFixed(0)}% scale`);
          return { optimizedBuffer: resizedBuffer, compressionRatio };
        }
      } catch (error) {
        console.warn(`Failed to resize to ${scale * 100}%:`, error.message);
        continue;
      }
    }

    // Fallback: aggressive compression with moderate resize
    console.log('🔥 Using fallback aggressive compression');
    const fallbackBuffer = await sharp(inputBuffer)
      .resize(Math.floor(originalWidth * 0.7), Math.floor(originalHeight * 0.7))
      .webp({
        quality: 40,
        effort: 6,
        smartSubsample: true,
      })
      .toBuffer();

    const compressionRatio = ((originalSize - fallbackBuffer.length) / originalSize) * 100;
    return { optimizedBuffer: fallbackBuffer, compressionRatio };
  }

  /**
   * Upload optimized buffer to Cloudinary
   */
  private async uploadToCloudinary(buffer: Buffer, originalName: string): Promise<any> {
    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create temporary file
    const tempPath = path.join(tempDir, `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`);
    
    try {
      // Write buffer to temp file
      fs.writeFileSync(tempPath, buffer);
      
      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(tempPath, {
        resource_type: 'image',
        format: 'webp',
        quality: 'auto:good', // Let Cloudinary handle final quality optimization
        fetch_format: 'auto',
        flags: 'progressive',
        folder: 'optimized-images', // Organize uploads in a folder
        use_filename: true,
        unique_filename: true,
      });

      console.log(`📤 Uploaded to Cloudinary: ${(uploadResult.bytes / 1024).toFixed(1)} KB`);
      return uploadResult;
      
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }
}