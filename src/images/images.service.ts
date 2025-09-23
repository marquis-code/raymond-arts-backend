// // import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
// // import { InjectModel } from "@nestjs/mongoose"
// // import type { Model } from "mongoose"
// // import { Image, type ImageDocument } from "./schemas/image.schema"
// // import { UploadService } from "../upload/upload.service"
// // import type { CreateImageDto } from "./dto/create-image.dto"
// // import type { UpdateImageDto } from "./dto/update-image.dto"
// // import type { Express } from "express"
// // import { v2 as cloudinary } from "cloudinary"

// // @Injectable()
// // export class ImagesService {
// //   private readonly supportedImageFormats = [
// //     'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'ico', 'avif', 'heic', 'heif'
// //   ];

// //   constructor(
// //     @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
// //     private uploadService: UploadService,
// //   ) {}

// //   private validateImageFile(file: Express.Multer.File): void {
// //     if (!file) {
// //       throw new BadRequestException("File is required")
// //     }

// //     // Check if it's an image by mimetype
// //     if (!file.mimetype.startsWith('image/')) {
// //       throw new BadRequestException("Only image files are allowed")
// //     }

// //     // Extract file extension
// //     const fileExtension = file.originalname?.split('.').pop()?.toLowerCase();
    
// //     // Additional validation for supported formats
// //     if (fileExtension && !this.supportedImageFormats.includes(fileExtension)) {
// //       throw new BadRequestException(
// //         `Unsupported image format. Supported formats: ${this.supportedImageFormats.join(', ')}`
// //       )
// //     }
// //   }

// //   async create(file: Express.Multer.File, createImageDto: CreateImageDto): Promise<Image> {
// //     this.validateImageFile(file);

// //     try {
// //       // Upload with web optimization
// //       const result = await this.uploadService.uploadFile(file, true) // true = optimize for web

// //       const newImage = new this.imageModel({
// //         name: createImageDto.name,
// //         description: createImageDto.description,
// //         tags: createImageDto.tags,
// //         url: result.secure_url,
// //         publicId: result.public_id,
// //         size: result.bytes,
// //         format: result.format,
// //         width: result.width,
// //         height: result.height,
// //       })

// //       return newImage.save()
// //     } catch (error) {
// //       throw new BadRequestException(error.message || "Failed to upload and save image")
// //     }
// //   }

// //   async createMany(files: Express.Multer.File[], createImageDto: CreateImageDto): Promise<Image[]> {
// //     // Validate all files first
// //     files.forEach(file => this.validateImageFile(file));

// //     try {
// //       // Upload all files with web optimization
// //       const uploadResults = await this.uploadService.uploadFiles(files, true) // true = optimize for web

// //       const images = uploadResults.map((result, index) => {
// //         return new this.imageModel({
// //           name: `${createImageDto.name}-${index + 1}`,
// //           description: createImageDto.description,
// //           tags: createImageDto.tags,
// //           url: result.secure_url,
// //           publicId: result.public_id,
// //           size: result.bytes,
// //           format: result.format,
// //           width: result.width,
// //           height: result.height,
// //         })
// //       })

// //       return this.imageModel.insertMany(images)
// //     } catch (error) {
// //       throw new BadRequestException(error.message || "Failed to upload and save images")
// //     }
// //   }

// //   async createWebP(file: Express.Multer.File, createImageDto: CreateImageDto): Promise<Image> {
// //     this.validateImageFile(file);

// //     try {
// //       // Assuming your UploadService has a method to convert to WebP
// //       // If not, you'll need to add this method to your UploadService
// //       const result = await this.uploadService.uploadFileAsWebP(file)

// //       const newImage = new this.imageModel({
// //         name: createImageDto.name,
// //         description: createImageDto.description,
// //         tags: createImageDto.tags,
// //         url: result.secure_url,
// //         publicId: result.public_id,
// //         size: result.bytes,
// //         format: 'webp', // Format is always WebP for this method
// //         width: result.width,
// //         height: result.height,
// //       })

// //       return newImage.save()
// //     } catch (error) {
// //       throw new BadRequestException(error.message || "Failed to upload and convert image to WebP")
// //     }
// //   }

// //   async findAll(): Promise<Image[]> {
// //     try {
// //       return await this.imageModel.find().exec()
// //     } catch (error) {
// //       throw new BadRequestException("Failed to retrieve images")
// //     }
// //   }

// //   async findOne(id: string): Promise<Image> {
// //     try {
// //       const image = await this.imageModel.findById(id).exec()
// //       if (!image) {
// //         throw new NotFoundException(`Image with ID ${id} not found`)
// //       }
// //       return image
// //     } catch (error) {
// //       if (error instanceof NotFoundException) {
// //         throw error
// //       }
// //       throw new BadRequestException("Failed to retrieve image")
// //     }
// //   }

// //   async update(id: string, updateImageDto: UpdateImageDto): Promise<Image> {
// //     try {
// //       const updatedImage = await this.imageModel.findByIdAndUpdate(id, updateImageDto, { new: true }).exec()

// //       if (!updatedImage) {
// //         throw new NotFoundException(`Image with ID ${id} not found`)
// //       }

// //       return updatedImage
// //     } catch (error) {
// //       if (error instanceof NotFoundException) {
// //         throw error
// //       }
// //       throw new BadRequestException("Failed to update image")
// //     }
// //   }

// //   async remove(id: string): Promise<void> {
// //     try {
// //       const image = await this.findOne(id)
      
// //       // Delete from cloud storage first
// //       await this.uploadService.deleteFile(image.publicId)
      
// //       // Then delete from database
// //       await this.imageModel.findByIdAndDelete(id).exec()
// //     } catch (error) {
// //       if (error instanceof NotFoundException) {
// //         throw error
// //       }
// //       throw new BadRequestException("Failed to delete image")
// //     }
// //   }

// //   // Method to get optimized image URLs for frontend
// //   async getOptimizedImageUrls(id: string): Promise<{
// //     optimized: string;
// //     thumbnail: string;
// //     small: string;
// //     medium: string;
// //     large: string;
// //   }> {
// //     const image = await this.findOne(id);
    
// //     // Generate optimized URLs directly using cloudinary.url
// //     const baseOptions = {
// //       fetch_format: "auto",
// //       quality: "auto:good",
// //       dpr: "auto",
// //       flags: "progressive"
// //     };

// //     return {
// //       optimized: cloudinary.url(image.publicId, baseOptions),
// //       thumbnail: cloudinary.url(image.publicId, { ...baseOptions, width: 150, height: 150, crop: "fill" }),
// //       small: cloudinary.url(image.publicId, { ...baseOptions, width: 400, crop: "scale" }),
// //       medium: cloudinary.url(image.publicId, { ...baseOptions, width: 800, crop: "scale" }),
// //       large: cloudinary.url(image.publicId, { ...baseOptions, width: 1200, crop: "scale" })
// //     };
// //   }

// //   // Override findAll to return optimized URLs
// //   async findAllOptimized(): Promise<any[]> {
// //     const images = await this.imageModel.find().exec();
    
// //     return images.map((image) => {
// //       // Generate optimized URL directly
// //       const optimizedUrl = cloudinary.url(image.publicId, {
// //         fetch_format: "auto",
// //         quality: "auto:good",
// //         dpr: "auto",
// //         flags: "progressive"
// //       });
      
// //       return {
// //         ...image.toObject(),
// //         optimizedUrl, // Add optimized URL for frontend use
// //       };
// //     });
// //   }
// // }




// import { Injectable, BadRequestException } from '@nestjs/common';
// import { v2 as cloudinary } from 'cloudinary';
// import sharp from 'sharp';
// import * as fs from 'fs';
// import * as path from 'path';

// @Injectable()
// export class UploadService {
//   constructor() {
//     // Configure cloudinary (make sure this is in your app module or config)
//     cloudinary.config({
//       cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//       api_key: process.env.CLOUDINARY_API_KEY,
//       api_secret: process.env.CLOUDINARY_API_SECRET,
//     });
//   }

//   async uploadFile(file: Express.Multer.File, optimizeForWeb: boolean = false): Promise<any> {
//     try {
//       if (optimizeForWeb) {
//         return this.uploadOptimized(file);
//       }
      
//       // Regular upload without conversion
//       return this.uploadDirect(file);
//     } catch (error) {
//       throw new BadRequestException(`Upload failed: ${error.message}`);
//     }
//   }

//   async uploadFiles(files: Express.Multer.File[], optimizeForWeb: boolean = false): Promise<any[]> {
//     const uploadPromises = files.map(file => this.uploadFile(file, optimizeForWeb));
//     return Promise.all(uploadPromises);
//   }

//   async uploadFileAsWebP(file: Express.Multer.File): Promise<any> {
//     try {
//       const originalSize = file.size;
//       console.log(`🎯 FORCING size reduction for: ${file.originalname}`);
//       console.log(`Original file size: ${originalSize} bytes (${(originalSize / 1024).toFixed(1)} KB)`);

//       // FORCE size reduction - no exceptions
//       const optimizedBuffer = await this.convertToOptimizedWebP(file.buffer, originalSize);
      
//       console.log(`✅ Size reduction achieved: ${originalSize} -> ${optimizedBuffer.length} bytes`);
//       console.log(`Reduction: ${((originalSize - optimizedBuffer.length) / originalSize * 100).toFixed(1)}%`);
      
//       // Create temp file for Cloudinary upload
//       const tempDir = path.join(process.cwd(), 'temp');
//       if (!fs.existsSync(tempDir)) {
//         fs.mkdirSync(tempDir, { recursive: true });
//       }
      
//       const tempPath = path.join(tempDir, `${Date.now()}-${Math.random()}.webp`);
//       fs.writeFileSync(tempPath, optimizedBuffer);

//       try {
//         // Upload to Cloudinary WITHOUT any further compression
//         const uploadResult = await cloudinary.uploader.upload(tempPath, {
//           resource_type: 'image',
//           format: 'webp',
//           quality: '100', // Don't re-compress our already optimized image
//           flags: 'preserve_transparency,immutable_cache',
//           // Explicitly prevent any transformations
//           transformation: [],
//           // Disable auto-optimization
//           fetch_format: 'webp',
//           auto_tagging: false,
//         });

//         console.log(`📤 Uploaded to Cloudinary: ${uploadResult.bytes} bytes`);
        
//         // Verify the size reduction was maintained
//         const finalReduction = ((originalSize - uploadResult.bytes) / originalSize * 100).toFixed(1);
//         console.log(`🎉 Final size reduction: ${finalReduction}%`);
        
//         if (uploadResult.bytes >= originalSize) {
//           console.warn('⚠️ WARNING: Cloudinary may have modified the file size!');
//         }

//         return uploadResult;
//       } finally {
//         // Clean up temp file
//         if (fs.existsSync(tempPath)) {
//           fs.unlinkSync(tempPath);
//         }
//       }
//     } catch (error) {
//       throw new BadRequestException(`Forced size reduction failed: ${error.message}`);
//     }
//   }

//   // New method for extreme compression when you need maximum size reduction
//   async uploadFileWithExtremeCompression(file: Express.Multer.File, targetSizeKB?: number): Promise<any> {
//     try {
//       const originalSize = file.size;
//       const targetSize = targetSizeKB ? targetSizeKB * 1024 : Math.floor(originalSize * 0.3); // 70% reduction by default
      
//       console.log(`🔥 EXTREME compression mode for: ${file.originalname}`);
//       console.log(`Original: ${(originalSize / 1024).toFixed(1)} KB -> Target: ${(targetSize / 1024).toFixed(1)} KB`);

//       const extremeBuffer = await this.extremeCompression(file.buffer, targetSize);
      
//       const tempDir = path.join(process.cwd(), 'temp');
//       if (!fs.existsSync(tempDir)) {
//         fs.mkdirSync(tempDir, { recursive: true });
//       }
      
//       const tempPath = path.join(tempDir, `${Date.now()}-extreme.webp`);
//       fs.writeFileSync(tempPath, extremeBuffer);

//       try {
//         const uploadResult = await cloudinary.uploader.upload(tempPath, {
//           resource_type: 'image',
//           format: 'webp',
//           quality: '100',
//           flags: 'preserve_transparency,immutable_cache',
//           transformation: [],
//         });

//         const finalReduction = ((originalSize - uploadResult.bytes) / originalSize * 100).toFixed(1);
//         console.log(`🎉 Extreme compression result: ${finalReduction}% reduction`);
        
//         return uploadResult;
//       } finally {
//         if (fs.existsSync(tempPath)) {
//           fs.unlinkSync(tempPath);
//         }
//       }
//     } catch (error) {
//       throw new BadRequestException(`Extreme compression failed: ${error.message}`);
//     }
//   }

//   private async extremeCompression(inputBuffer: Buffer, targetSize: number): Promise<Buffer> {
//     console.log(`🔥 Applying extreme compression - target: ${targetSize} bytes`);
    
//     const metadata = await sharp(inputBuffer).metadata();
//     const originalWidth = metadata.width || 1920;
//     const originalHeight = metadata.height || 1080;

//     // Start with very aggressive settings
//     const strategies = [
//       // Strategy 1: Low quality, original dimensions
//       { width: originalWidth, height: originalHeight, quality: 10 },
//       // Strategy 2: Medium quality, 80% dimensions
//       { width: Math.floor(originalWidth * 0.8), height: Math.floor(originalHeight * 0.8), quality: 20 },
//       // Strategy 3: Medium quality, 60% dimensions
//       { width: Math.floor(originalWidth * 0.6), height: Math.floor(originalHeight * 0.6), quality: 30 },
//       // Strategy 4: Higher quality, 50% dimensions
//       { width: Math.floor(originalWidth * 0.5), height: Math.floor(originalHeight * 0.5), quality: 50 },
//       // Strategy 5: Higher quality, 40% dimensions
//       { width: Math.floor(originalWidth * 0.4), height: Math.floor(originalHeight * 0.4), quality: 60 },
//       // Strategy 6: Very small dimensions
//       { width: Math.min(400, originalWidth), height: Math.min(300, originalHeight), quality: 40 },
//     ];

//     for (const strategy of strategies) {
//       try {
//         const compressed = await sharp(inputBuffer)
//           .resize(strategy.width, strategy.height, {
//             kernel: sharp.kernel.lanczos3,
//             withoutEnlargement: true,
//           })
//           .webp({
//             quality: strategy.quality,
//             effort: 6,
//             smartSubsample: true,
//             reductionEffort: 6,
//           })
//           .toBuffer();

//         console.log(`Strategy ${strategy.width}x${strategy.height} @ ${strategy.quality}%: ${compressed.length} bytes`);

//         if (compressed.length <= targetSize) {
//           console.log(`✅ Extreme compression successful with ${strategy.width}x${strategy.height} @ ${strategy.quality}%`);
//           return compressed;
//         }
//       } catch (error) {
//         console.warn(`Strategy failed:`, error.message);
//         continue;
//       }
//     }

//     // Absolute last resort - tiny image with very low quality
//     console.log('🚨 Last resort: Creating tiny image...');
//     return sharp(inputBuffer)
//       .resize(200, 150, { 
//         kernel: sharp.kernel.nearest,
//         withoutEnlargement: true 
//       })
//       .webp({
//         quality: 5,
//         effort: 3,
//       })
//       .toBuffer();
//   }

//   private async uploadDirect(file: Express.Multer.File): Promise<any> {
//     // Create temp file for direct upload
//     const tempDir = path.join(process.cwd(), 'temp');
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir, { recursive: true });
//     }
    
//     const tempPath = path.join(tempDir, `${Date.now()}-${Math.random()}-${file.originalname}`);
//     fs.writeFileSync(tempPath, file.buffer);

//     try {
//       const uploadResult = await cloudinary.uploader.upload(tempPath, {
//         resource_type: 'auto',
//         quality: 'auto:best',
//         flags: 'preserve_transparency',
//       });

//       return uploadResult;
//     } finally {
//       if (fs.existsSync(tempPath)) {
//         fs.unlinkSync(tempPath);
//       }
//     }
//   }

//   private async uploadOptimized(file: Express.Multer.File): Promise<any> {
//     // For web optimization, FORCE size reduction
//     const originalSize = file.size;
//     console.log(`🎯 Web optimization: FORCING size reduction for ${file.originalname}`);
    
//     // Always try WebP first since it typically gives better compression
//     const webpResult = await this.tryWebPConversion(file.buffer, originalSize);
    
//     if (webpResult.shouldUseWebP) {
//       return this.uploadBufferAsWebP(webpResult.buffer, originalSize);
//     } else {
//       // If WebP failed, use the already size-reduced original format
//       return this.uploadReducedOriginal(webpResult.buffer, file.originalname);
//     }
//   }

//   private async uploadReducedOriginal(buffer: Buffer, originalName: string): Promise<any> {
//     const tempDir = path.join(process.cwd(), 'temp');
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir, { recursive: true });
//     }
    
//     // Determine file extension from original name
//     const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
//     const tempPath = path.join(tempDir, `${Date.now()}-reduced.${extension}`);
//     fs.writeFileSync(tempPath, buffer);

//     try {
//       const uploadResult = await cloudinary.uploader.upload(tempPath, {
//         resource_type: 'image',
//         quality: '100', // Don't re-compress our already optimized image
//         flags: 'preserve_transparency,immutable_cache',
//         transformation: [],
//       });

//       console.log(`📤 Uploaded reduced original format: ${uploadResult.bytes} bytes`);
//       return uploadResult;
//     } finally {
//       if (fs.existsSync(tempPath)) {
//         fs.unlinkSync(tempPath);
//       }
//     }
//   }

//   private async convertToOptimizedWebP(inputBuffer: Buffer, targetMaxSize: number): Promise<Buffer> {
//     // FORCEFUL size reduction - target 70% of original size or smaller
//     const targetSize = Math.floor(targetMaxSize * 0.7); // Target 30% reduction
//     console.log(`Target size reduction: ${targetMaxSize} -> ${targetSize} bytes (70% of original)`);

//     // Aggressive quality levels - start lower and go even lower if needed
//     const qualityLevels = [75, 65, 55, 45, 35, 25, 20, 15];
    
//     for (const quality of qualityLevels) {
//       try {
//         const webpBuffer = await sharp(inputBuffer)
//           .webp({
//             quality,
//             effort: 6, // Maximum compression effort
//             smartSubsample: true,
//             reductionEffort: 6,
//             nearLossless: false,
//             lossless: false,
//             // Add aggressive compression settings
//             preset: 'photo', // Optimize for photos
//           })
//           .toBuffer();

//         console.log(`WebP at ${quality}% quality: ${webpBuffer.length} bytes (target: ${targetSize} bytes)`);

//         // Accept if it meets our target size reduction
//         if (webpBuffer.length <= targetSize) {
//           console.log(`✅ FORCED size reduction achieved! Quality: ${quality}%`);
//           console.log(`Size reduction: ${((targetMaxSize - webpBuffer.length) / targetMaxSize * 100).toFixed(1)}%`);
//           return webpBuffer;
//         }
//       } catch (error) {
//         console.warn(`Failed to convert at ${quality}% quality:`, error.message);
//         continue;
//       }
//     }

//     // If still too large, try with dimension reduction
//     console.log('⚠️ Quality reduction not enough, trying dimension reduction...');
//     return this.forceReduceWithDimensions(inputBuffer, targetSize);
//   }

//   private async forceReduceWithDimensions(inputBuffer: Buffer, targetSize: number): Promise<Buffer> {
//     // Get original dimensions
//     const metadata = await sharp(inputBuffer).metadata();
//     const originalWidth = metadata.width || 1920;
//     const originalHeight = metadata.height || 1080;
    
//     console.log(`Original dimensions: ${originalWidth}x${originalHeight}`);

//     // Try reducing dimensions by percentages until we hit target size
//     const reductionPercentages = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
    
//     for (const reduction of reductionPercentages) {
//       const newWidth = Math.floor(originalWidth * reduction);
//       const newHeight = Math.floor(originalHeight * reduction);
      
//       try {
//         const reducedBuffer = await sharp(inputBuffer)
//           .resize(newWidth, newHeight, {
//             kernel: sharp.kernel.lanczos3, // High quality resizing
//             withoutEnlargement: true,
//           })
//           .webp({
//             quality: 60, // Moderate quality for resized images
//             effort: 6,
//             smartSubsample: true,
//             reductionEffort: 6,
//           })
//           .toBuffer();

//         console.log(`Resized to ${newWidth}x${newHeight} (${(reduction * 100).toFixed(0)}%): ${reducedBuffer.length} bytes`);

//         if (reducedBuffer.length <= targetSize) {
//           console.log(`✅ FORCED size reduction with dimensions! ${originalWidth}x${originalHeight} -> ${newWidth}x${newHeight}`);
//           console.log(`Final size reduction: ${((inputBuffer.length - reducedBuffer.length) / inputBuffer.length * 100).toFixed(1)}%`);
//           return reducedBuffer;
//         }
//       } catch (error) {
//         console.warn(`Failed to resize to ${reduction * 100}%:`, error.message);
//         continue;
//       }
//     }

//     // Absolute last resort - very aggressive compression with small dimensions
//     console.log('🔥 EXTREME compression mode activated...');
//     const extremeWidth = Math.min(800, originalWidth);
//     const extremeHeight = Math.min(600, originalHeight);
    
//     return sharp(inputBuffer)
//       .resize(extremeWidth, extremeHeight, {
//         kernel: sharp.kernel.lanczos3,
//         withoutEnlargement: true,
//       })
//       .webp({
//         quality: 15, // Very low quality
//         effort: 6,
//         smartSubsample: true,
//       })
//       .toBuffer();
//   }

//   private async tryWebPConversion(inputBuffer: Buffer, originalSize: number): Promise<{
//     buffer: Buffer;
//     shouldUseWebP: boolean;
//   }> {
//     try {
//       const webpBuffer = await this.convertToOptimizedWebP(inputBuffer, originalSize);
      
//       // ALWAYS use WebP since we're forcing size reduction
//       console.log(`Forced WebP conversion: ${originalSize} -> ${webpBuffer.length} bytes`);
//       console.log(`Size reduction: ${((originalSize - webpBuffer.length) / originalSize * 100).toFixed(1)}%`);
      
//       return {
//         buffer: webpBuffer,
//         shouldUseWebP: true, // Always true now since we force size reduction
//       };
//     } catch (error) {
//       console.error('WebP conversion failed completely:', error.message);
//       // Even if WebP fails, try to reduce original format size
//       const reducedOriginal = await this.forceReduceOriginalFormat(inputBuffer, originalSize);
//       return {
//         buffer: reducedOriginal,
//         shouldUseWebP: false,
//       };
//     }
//   }

//   private async forceReduceOriginalFormat(inputBuffer: Buffer, originalSize: number): Promise<Buffer> {
//     const targetSize = Math.floor(originalSize * 0.7); // Target 30% reduction
//     console.log(`Forcing size reduction on original format: ${originalSize} -> ${targetSize} bytes`);

//     try {
//       const metadata = await sharp(inputBuffer).metadata();
//       const format = metadata.format;

//       if (format === 'jpeg' || format === 'jpg') {
//         // Aggressive JPEG compression
//         const qualityLevels = [60, 50, 40, 30, 25, 20];
//         for (const quality of qualityLevels) {
//           const compressed = await sharp(inputBuffer)
//             .jpeg({
//               quality,
//               progressive: true,
//               mozjpeg: true,
//               optimiseScans: true,
//               overshootDeringing: true,
//             })
//             .toBuffer();
          
//           if (compressed.length <= targetSize) {
//             console.log(`✅ JPEG compressed to ${quality}% quality: ${compressed.length} bytes`);
//             return compressed;
//           }
//         }
//       } else if (format === 'png') {
//         // Aggressive PNG compression with possible conversion to palette
//         try {
//           const compressed = await sharp(inputBuffer)
//             .png({
//               compressionLevel: 9,
//               adaptiveFiltering: true,
//               progressive: true,
//               palette: true, // Convert to palette if possible
//             })
//             .toBuffer();
          
//           if (compressed.length <= targetSize) {
//             console.log(`✅ PNG compressed: ${compressed.length} bytes`);
//             return compressed;
//           }
//         } catch (error) {
//           // If palette conversion fails, try without it
//           const compressed = await sharp(inputBuffer)
//             .png({
//               compressionLevel: 9,
//               adaptiveFiltering: true,
//               progressive: true,
//             })
//             .toBuffer();
          
//           if (compressed.length <= targetSize) {
//             console.log(`✅ PNG compressed (no palette): ${compressed.length} bytes`);
//             return compressed;
//           }
//         }
//       }

//       // If format-specific compression didn't work, try dimension reduction
//       return this.forceReduceWithDimensions(inputBuffer, targetSize);
//     } catch (error) {
//       console.error('Original format compression failed:', error.message);
//       return inputBuffer; // Return original as last resort
//     }
//   }

//   private async uploadBufferAsWebP(buffer: Buffer, originalSize: number): Promise<any> {
//     const tempDir = path.join(process.cwd(), 'temp');
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir, { recursive: true });
//     }
    
//     const tempPath = path.join(tempDir, `${Date.now()}-webp.webp`);
//     fs.writeFileSync(tempPath, buffer);

//     try {
//       const uploadResult = await cloudinary.uploader.upload(tempPath, {
//         resource_type: 'image',
//         format: 'webp',
//         quality: '100', // Don't re-compress, we already optimized
//         flags: 'preserve_transparency',
//       });

//       return uploadResult;
//     } finally {
//       if (fs.existsSync(tempPath)) {
//         fs.unlinkSync(tempPath);
//       }
//     }
//   }

//   private async uploadOptimizedOriginal(file: Express.Multer.File): Promise<any> {
//     // Optimize the original format without changing it
//     let optimizedBuffer: Buffer;
    
//     try {
//       if (file.mimetype.includes('jpeg') || file.mimetype.includes('jpg')) {
//         optimizedBuffer = await sharp(file.buffer)
//           .jpeg({
//             quality: 85,
//             progressive: true,
//             mozjpeg: true,
//           })
//           .toBuffer();
//       } else if (file.mimetype.includes('png')) {
//         optimizedBuffer = await sharp(file.buffer)
//           .png({
//             compressionLevel: 9,
//             progressive: true,
//           })
//           .toBuffer();
//       } else {
//         // For other formats, use minimal processing
//         optimizedBuffer = file.buffer;
//       }
//     } catch (error) {
//       console.warn('Optimization failed, using original:', error.message);
//       optimizedBuffer = file.buffer;
//     }

//     const tempDir = path.join(process.cwd(), 'temp');
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir, { recursive: true });
//     }
    
//     const tempPath = path.join(tempDir, `${Date.now()}-opt-${file.originalname}`);
//     fs.writeFileSync(tempPath, optimizedBuffer);

//     try {
//       const uploadResult = await cloudinary.uploader.upload(tempPath, {
//         resource_type: 'auto',
//         quality: '100', // Don't re-compress
//         flags: 'preserve_transparency',
//       });

//       return uploadResult;
//     } finally {
//       if (fs.existsSync(tempPath)) {
//         fs.unlinkSync(tempPath);
//       }
//     }
//   }

//   async deleteFile(publicId: string): Promise<void> {
//     try {
//       await cloudinary.uploader.destroy(publicId);
//     } catch (error) {
//       throw new BadRequestException(`Failed to delete file: ${error.message}`);
//     }
//   }
// }




import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImagesService {
  constructor() {
    // Configure cloudinary (make sure this is in your app module or config)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(file: Express.Multer.File, optimizeForWeb: boolean = false): Promise<any> {
    try {
      if (optimizeForWeb) {
        return this.uploadOptimized(file);
      }
      
      // Regular upload without conversion
      return this.uploadDirect(file);
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  async uploadFiles(files: Express.Multer.File[], optimizeForWeb: boolean = false): Promise<any[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, optimizeForWeb));
    return Promise.all(uploadPromises);
  }

  async uploadFileAsWebP(file: Express.Multer.File): Promise<any> {
    try {
      const originalSize = file.size;
      console.log(`🎯 FORCING size reduction for: ${file.originalname}`);
      console.log(`Original file size: ${originalSize} bytes (${(originalSize / 1024).toFixed(1)} KB)`);

      // FORCE size reduction - no exceptions
      const optimizedBuffer = await this.convertToOptimizedWebP(file.buffer, originalSize);
      
      console.log(`✅ Size reduction achieved: ${originalSize} -> ${optimizedBuffer.length} bytes`);
      console.log(`Reduction: ${((originalSize - optimizedBuffer.length) / originalSize * 100).toFixed(1)}%`);
      
      // Create temp file for Cloudinary upload
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempPath = path.join(tempDir, `${Date.now()}-${Math.random()}.webp`);
      fs.writeFileSync(tempPath, optimizedBuffer);

      try {
        // Upload to Cloudinary WITHOUT any further compression
        const uploadResult = await cloudinary.uploader.upload(tempPath, {
          resource_type: 'image',
          format: 'webp',
          quality: '100', // Don't re-compress our already optimized image
          flags: 'preserve_transparency,immutable_cache',
          // Explicitly prevent any transformations
          transformation: [],
          // Disable auto-optimization
          fetch_format: 'webp',
          auto_tagging: false,
        });

        console.log(`📤 Uploaded to Cloudinary: ${uploadResult.bytes} bytes`);
        
        // Verify the size reduction was maintained
        const finalReduction = ((originalSize - uploadResult.bytes) / originalSize * 100).toFixed(1);
        console.log(`🎉 Final size reduction: ${finalReduction}%`);
        
        if (uploadResult.bytes >= originalSize) {
          console.warn('⚠️ WARNING: Cloudinary may have modified the file size!');
        }

        return uploadResult;
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    } catch (error) {
      throw new BadRequestException(`Forced size reduction failed: ${error.message}`);
    }
  }

  // New method for extreme compression when you need maximum size reduction
  async uploadFileWithExtremeCompression(file: Express.Multer.File, targetSizeKB?: number): Promise<any> {
    try {
      const originalSize = file.size;
      const targetSize = targetSizeKB ? targetSizeKB * 1024 : Math.floor(originalSize * 0.3); // 70% reduction by default
      
      console.log(`🔥 EXTREME compression mode for: ${file.originalname}`);
      console.log(`Original: ${(originalSize / 1024).toFixed(1)} KB -> Target: ${(targetSize / 1024).toFixed(1)} KB`);

      const extremeBuffer = await this.extremeCompression(file.buffer, targetSize);
      
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempPath = path.join(tempDir, `${Date.now()}-extreme.webp`);
      fs.writeFileSync(tempPath, extremeBuffer);

      try {
        const uploadResult = await cloudinary.uploader.upload(tempPath, {
          resource_type: 'image',
          format: 'webp',
          quality: '100',
          flags: 'preserve_transparency,immutable_cache',
          transformation: [],
        });

        const finalReduction = ((originalSize - uploadResult.bytes) / originalSize * 100).toFixed(1);
        console.log(`🎉 Extreme compression result: ${finalReduction}% reduction`);
        
        return uploadResult;
      } finally {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    } catch (error) {
      throw new BadRequestException(`Extreme compression failed: ${error.message}`);
    }
  }

  private async extremeCompression(inputBuffer: Buffer, targetSize: number): Promise<Buffer> {
    console.log(`🔥 Applying extreme compression - target: ${targetSize} bytes`);
    
    const metadata = await sharp(inputBuffer).metadata();
    const originalWidth = metadata.width || 1920;
    const originalHeight = metadata.height || 1080;

    // Start with very aggressive settings
    const strategies = [
      // Strategy 1: Low quality, original dimensions
      { width: originalWidth, height: originalHeight, quality: 10 },
      // Strategy 2: Medium quality, 80% dimensions
      { width: Math.floor(originalWidth * 0.8), height: Math.floor(originalHeight * 0.8), quality: 20 },
      // Strategy 3: Medium quality, 60% dimensions
      { width: Math.floor(originalWidth * 0.6), height: Math.floor(originalHeight * 0.6), quality: 30 },
      // Strategy 4: Higher quality, 50% dimensions
      { width: Math.floor(originalWidth * 0.5), height: Math.floor(originalHeight * 0.5), quality: 50 },
      // Strategy 5: Higher quality, 40% dimensions
      { width: Math.floor(originalWidth * 0.4), height: Math.floor(originalHeight * 0.4), quality: 60 },
      // Strategy 6: Very small dimensions
      { width: Math.min(400, originalWidth), height: Math.min(300, originalHeight), quality: 40 },
    ];

    for (const strategy of strategies) {
      try {
        const compressed = await sharp(inputBuffer)
          .resize(strategy.width, strategy.height, {
            kernel: sharp.kernel.lanczos3,
            withoutEnlargement: true,
          })
          .webp({
            quality: strategy.quality,
            effort: 6,
            smartSubsample: true,
          })
          .toBuffer();

        console.log(`Strategy ${strategy.width}x${strategy.height} @ ${strategy.quality}%: ${compressed.length} bytes`);

        if (compressed.length <= targetSize) {
          console.log(`✅ Extreme compression successful with ${strategy.width}x${strategy.height} @ ${strategy.quality}%`);
          return compressed;
        }
      } catch (error) {
        console.warn(`Strategy failed:`, error.message);
        continue;
      }
    }

    // Absolute last resort - tiny image with very low quality
    console.log('🚨 Last resort: Creating tiny image...');
    return sharp(inputBuffer)
      .resize(200, 150, { 
        kernel: sharp.kernel.nearest,
        withoutEnlargement: true 
      })
      .webp({
        quality: 5,
        effort: 3,
      })
      .toBuffer();
  }

  private async uploadDirect(file: Express.Multer.File): Promise<any> {
    // Create temp file for direct upload
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempPath = path.join(tempDir, `${Date.now()}-${Math.random()}-${file.originalname}`);
    fs.writeFileSync(tempPath, file.buffer);

    try {
      const uploadResult = await cloudinary.uploader.upload(tempPath, {
        resource_type: 'auto',
        quality: 'auto:best',
        flags: 'preserve_transparency',
      });

      return uploadResult;
    } finally {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  private async uploadOptimized(file: Express.Multer.File): Promise<any> {
    // For web optimization, FORCE size reduction
    const originalSize = file.size;
    console.log(`🎯 Web optimization: FORCING size reduction for ${file.originalname}`);
    
    // Always try WebP first since it typically gives better compression
    const webpResult = await this.tryWebPConversion(file.buffer, originalSize);
    
    if (webpResult.shouldUseWebP) {
      return this.uploadBufferAsWebP(webpResult.buffer, originalSize);
    } else {
      // If WebP failed, use the already size-reduced original format
      return this.uploadReducedOriginal(webpResult.buffer, file.originalname);
    }
  }

  private async uploadReducedOriginal(buffer: Buffer, originalName: string): Promise<any> {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Determine file extension from original name
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const tempPath = path.join(tempDir, `${Date.now()}-reduced.${extension}`);
    fs.writeFileSync(tempPath, buffer);

    try {
      const uploadResult = await cloudinary.uploader.upload(tempPath, {
        resource_type: 'image',
        quality: '100', // Don't re-compress our already optimized image
        flags: 'preserve_transparency,immutable_cache',
        transformation: [],
      });

      console.log(`📤 Uploaded reduced original format: ${uploadResult.bytes} bytes`);
      return uploadResult;
    } finally {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  private async convertToOptimizedWebP(inputBuffer: Buffer, targetMaxSize: number): Promise<Buffer> {
    // FORCEFUL size reduction - target 70% of original size or smaller
    const targetSize = Math.floor(targetMaxSize * 0.7); // Target 30% reduction
    console.log(`Target size reduction: ${targetMaxSize} -> ${targetSize} bytes (70% of original)`);

    // Aggressive quality levels - start lower and go even lower if needed
    const qualityLevels = [75, 65, 55, 45, 35, 25, 20, 15];
    
    for (const quality of qualityLevels) {
      try {
        const webpBuffer = await sharp(inputBuffer)
          .webp({
            quality,
            effort: 6, // Maximum compression effort
            smartSubsample: true,
            nearLossless: false,
            lossless: false,
            // Add aggressive compression settings
            preset: 'photo', // Optimize for photos
          })
          .toBuffer();

        console.log(`WebP at ${quality}% quality: ${webpBuffer.length} bytes (target: ${targetSize} bytes)`);

        // Accept if it meets our target size reduction
        if (webpBuffer.length <= targetSize) {
          console.log(`✅ FORCED size reduction achieved! Quality: ${quality}%`);
          console.log(`Size reduction: ${((targetMaxSize - webpBuffer.length) / targetMaxSize * 100).toFixed(1)}%`);
          return webpBuffer;
        }
      } catch (error) {
        console.warn(`Failed to convert at ${quality}% quality:`, error.message);
        continue;
      }
    }

    // If still too large, try with dimension reduction
    console.log('⚠️ Quality reduction not enough, trying dimension reduction...');
    return this.forceReduceWithDimensions(inputBuffer, targetSize);
  }

  private async forceReduceWithDimensions(inputBuffer: Buffer, targetSize: number): Promise<Buffer> {
    // Get original dimensions
    const metadata = await sharp(inputBuffer).metadata();
    const originalWidth = metadata.width || 1920;
    const originalHeight = metadata.height || 1080;
    
    console.log(`Original dimensions: ${originalWidth}x${originalHeight}`);

    // Try reducing dimensions by percentages until we hit target size
    const reductionPercentages = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
    
    for (const reduction of reductionPercentages) {
      const newWidth = Math.floor(originalWidth * reduction);
      const newHeight = Math.floor(originalHeight * reduction);
      
      try {
        const reducedBuffer = await sharp(inputBuffer)
          .resize(newWidth, newHeight, {
            kernel: sharp.kernel.lanczos3, // High quality resizing
            withoutEnlargement: true,
          })
          .webp({
            quality: 60, // Moderate quality for resized images
            effort: 6,
            smartSubsample: true,
          })
          .toBuffer();

        console.log(`Resized to ${newWidth}x${newHeight} (${(reduction * 100).toFixed(0)}%): ${reducedBuffer.length} bytes`);

        if (reducedBuffer.length <= targetSize) {
          console.log(`✅ FORCED size reduction with dimensions! ${originalWidth}x${originalHeight} -> ${newWidth}x${newHeight}`);
          console.log(`Final size reduction: ${((inputBuffer.length - reducedBuffer.length) / inputBuffer.length * 100).toFixed(1)}%`);
          return reducedBuffer;
        }
      } catch (error) {
        console.warn(`Failed to resize to ${reduction * 100}%:`, error.message);
        continue;
      }
    }

    // Absolute last resort - very aggressive compression with small dimensions
    console.log('🔥 EXTREME compression mode activated...');
    const extremeWidth = Math.min(800, originalWidth);
    const extremeHeight = Math.min(600, originalHeight);
    
    return sharp(inputBuffer)
      .resize(extremeWidth, extremeHeight, {
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: true,
      })
      .webp({
        quality: 15, // Very low quality
        effort: 6,
        smartSubsample: true,
      })
      .toBuffer();
  }

  private async tryWebPConversion(inputBuffer: Buffer, originalSize: number): Promise<{
    buffer: Buffer;
    shouldUseWebP: boolean;
  }> {
    try {
      const webpBuffer = await this.convertToOptimizedWebP(inputBuffer, originalSize);
      
      // ALWAYS use WebP since we're forcing size reduction
      console.log(`Forced WebP conversion: ${originalSize} -> ${webpBuffer.length} bytes`);
      console.log(`Size reduction: ${((originalSize - webpBuffer.length) / originalSize * 100).toFixed(1)}%`);
      
      return {
        buffer: webpBuffer,
        shouldUseWebP: true, // Always true now since we force size reduction
      };
    } catch (error) {
      console.error('WebP conversion failed completely:', error.message);
      // Even if WebP fails, try to reduce original format size
      const reducedOriginal = await this.forceReduceOriginalFormat(inputBuffer, originalSize);
      return {
        buffer: reducedOriginal,
        shouldUseWebP: false,
      };
    }
  }

  private async forceReduceOriginalFormat(inputBuffer: Buffer, originalSize: number): Promise<Buffer> {
    const targetSize = Math.floor(originalSize * 0.7); // Target 30% reduction
    console.log(`Forcing size reduction on original format: ${originalSize} -> ${targetSize} bytes`);

    try {
      const metadata = await sharp(inputBuffer).metadata();
      const format = metadata.format;

      if (format === 'jpeg' || format === 'jpg') {
        // Aggressive JPEG compression
        const qualityLevels = [60, 50, 40, 30, 25, 20];
        for (const quality of qualityLevels) {
          const compressed = await sharp(inputBuffer)
            .jpeg({
              quality,
              progressive: true,
              mozjpeg: true,
              optimiseScans: true,
              overshootDeringing: true,
            })
            .toBuffer();
          
          if (compressed.length <= targetSize) {
            console.log(`✅ JPEG compressed to ${quality}% quality: ${compressed.length} bytes`);
            return compressed;
          }
        }
      } else if (format === 'png') {
        // Aggressive PNG compression with possible conversion to palette
        try {
          const compressed = await sharp(inputBuffer)
            .png({
              compressionLevel: 9,
              adaptiveFiltering: true,
              progressive: true,
              palette: true, // Convert to palette if possible
            })
            .toBuffer();
          
          if (compressed.length <= targetSize) {
            console.log(`✅ PNG compressed: ${compressed.length} bytes`);
            return compressed;
          }
        } catch (error) {
          // If palette conversion fails, try without it
          const compressed = await sharp(inputBuffer)
            .png({
              compressionLevel: 9,
              adaptiveFiltering: true,
              progressive: true,
            })
            .toBuffer();
          
          if (compressed.length <= targetSize) {
            console.log(`✅ PNG compressed (no palette): ${compressed.length} bytes`);
            return compressed;
          }
        }
      }

      // If format-specific compression didn't work, try dimension reduction
      return this.forceReduceWithDimensions(inputBuffer, targetSize);
    } catch (error) {
      console.error('Original format compression failed:', error.message);
      return inputBuffer; // Return original as last resort
    }
  }

  private async uploadBufferAsWebP(buffer: Buffer, originalSize: number): Promise<any> {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempPath = path.join(tempDir, `${Date.now()}-webp.webp`);
    fs.writeFileSync(tempPath, buffer);

    try {
      const uploadResult = await cloudinary.uploader.upload(tempPath, {
        resource_type: 'image',
        format: 'webp',
        quality: '100', // Don't re-compress, we already optimized
        flags: 'preserve_transparency',
      });

      return uploadResult;
    } finally {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  private async uploadOptimizedOriginal(file: Express.Multer.File): Promise<any> {
    // Optimize the original format without changing it
    let optimizedBuffer: Buffer;
    
    try {
      if (file.mimetype.includes('jpeg') || file.mimetype.includes('jpg')) {
        optimizedBuffer = await sharp(file.buffer)
          .jpeg({
            quality: 85,
            progressive: true,
            mozjpeg: true,
          })
          .toBuffer();
      } else if (file.mimetype.includes('png')) {
        optimizedBuffer = await sharp(file.buffer)
          .png({
            compressionLevel: 9,
            progressive: true,
          })
          .toBuffer();
      } else {
        // For other formats, use minimal processing
        optimizedBuffer = file.buffer;
      }
    } catch (error) {
      console.warn('Optimization failed, using original:', error.message);
      optimizedBuffer = file.buffer;
    }

    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempPath = path.join(tempDir, `${Date.now()}-opt-${file.originalname}`);
    fs.writeFileSync(tempPath, optimizedBuffer);

    try {
      const uploadResult = await cloudinary.uploader.upload(tempPath, {
        resource_type: 'auto',
        quality: '100', // Don't re-compress
        flags: 'preserve_transparency',
      });

      return uploadResult;
    } finally {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }
}