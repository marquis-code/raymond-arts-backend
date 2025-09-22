
// // @ts-nocheck
// import { Injectable, BadRequestException } from "@nestjs/common"
// import { v2 as cloudinary } from "cloudinary"
// import type { UploadResponse } from "./upload-response"
// import * as streamifier from "streamifier"
// import * as sharp from "sharp"
// import type { Express } from "express"

// @Injectable()
// export class UploadService {
//   private readonly supportedImageFormats = [
//     'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'ico', 'avif', 'heic', 'heif'
//   ];

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

//   async uploadFile(file: Express.Multer.File, optimizeForWeb = true): Promise<UploadResponse> {
//     this.validateImageFile(file);

//     return new Promise<UploadResponse>((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           folder: "nest-cloudinary",
//           resource_type: "image",
//           allowed_formats: this.supportedImageFormats,
//           quality: "auto:good",
//           flags: "progressive",
//           format: "auto",
//           fetch_format: "auto",
//           dpr: "auto",
//         },
//         (error, result: any) => {
//           if (error) return reject(error)
//           resolve(result)
//         },
//       )

//       streamifier.createReadStream(file.buffer).pipe(uploadStream)
//     })
//   }

//   async uploadFiles(files: Express.Multer.File[], optimizeForWeb = true): Promise<UploadResponse[]> {
//     // Validate all files first
//     files.forEach(file => this.validateImageFile(file));

//     const uploadPromises = files.map((file) => this.uploadFile(file, optimizeForWeb))
//     return Promise.all(uploadPromises)
//   }

//   async uploadFileAsWebP(file: Express.Multer.File): Promise<UploadResponse> {
//     this.validateImageFile(file);

//     return new Promise<UploadResponse>((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           folder: "nest-cloudinary",
//           resource_type: "image",
//           format: "webp",
//           quality: "auto",
//           fetch_format: "webp",
//           flags: "progressive",
//         },
//         (error, result: any) => {
//           if (error) return reject(error)
//           resolve(result)
//         },
//       )

//       streamifier.createReadStream(file.buffer).pipe(uploadStream)
//     })
//   }

//   /**
//    * Convert image buffer to WebP format using Sharp
//    */
//   private async convertToWebP(
//     buffer: Buffer, 
//     options: {
//       quality?: number;
//       width?: number;
//       height?: number;
//       lossless?: boolean;
//       effort?: number;
//     } = {}
//   ): Promise<Buffer> {
//     try {
//       let sharpInstance = sharp(buffer);

//       // Resize if dimensions provided
//       if (options.width || options.height) {
//         sharpInstance = sharpInstance.resize(options.width, options.height, {
//           fit: 'inside',
//           withoutEnlargement: true
//         });
//       }

//       // Convert to WebP with specified options
//       const webpOptions: sharp.WebpOptions = {
//         quality: options.quality || 80,
//         lossless: options.lossless || false,
//         effort: options.effort || 4, // 0-6, higher = better compression
//       };

//       const webpBuffer = await sharpInstance
//         .webp(webpOptions)
//         .toBuffer();

//       return webpBuffer;
//     } catch (error) {
//       throw new BadRequestException(`Failed to convert image to WebP: ${error.message}`);
//     }
//   }

//   /**
//    * Convert and upload image as WebP (conversion happens before upload)
//    */
//   async convertAndUploadAsWebP(
//     file: Express.Multer.File, 
//     options?: {
//       quality?: number;
//       width?: number;
//       height?: number;
//       lossless?: boolean;
//       effort?: number;
//       folder?: string;
//     }
//   ): Promise<UploadResponse> {
//     this.validateImageFile(file);

//     try {
//       // Convert to WebP before uploading
//       const webpBuffer = await this.convertToWebP(file.buffer, {
//         quality: options?.quality,
//         width: options?.width,
//         height: options?.height,
//         lossless: options?.lossless,
//         effort: options?.effort
//       });

//       // Create a new file object with WebP buffer
//       const webpFile: Express.Multer.File = {
//         ...file,
//         buffer: webpBuffer,
//         mimetype: 'image/webp',
//         originalname: file.originalname.replace(/\.[^/.]+$/, '.webp'),
//         size: webpBuffer.length
//       };

//       return new Promise<UploadResponse>((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream(
//           {
//             folder: options?.folder || "nest-cloudinary-webp",
//             resource_type: "image",
//             format: "webp",
//             quality: "auto:good",
//             flags: "progressive",
//           },
//           (error, result: any) => {
//             if (error) return reject(error)
//             resolve(result)
//           },
//         )

//         streamifier.createReadStream(webpFile.buffer).pipe(uploadStream)
//       })
//     } catch (error) {
//       throw new BadRequestException(`WebP conversion failed: ${error.message}`);
//     }
//   }

//   /**
//    * Batch convert multiple images to WebP before uploading
//    */
//   async convertMultipleToWebP(
//     files: Express.Multer.File[], 
//     options?: {
//       quality?: number;
//       width?: number;
//       height?: number;
//       lossless?: boolean;
//       effort?: number;
//       folder?: string;
//     }
//   ): Promise<UploadResponse[]> {
//     // Validate all files first
//     files.forEach(file => this.validateImageFile(file));

//     const uploadPromises = files.map((file) => 
//       this.convertAndUploadAsWebP(file, options)
//     );
    
//     return Promise.all(uploadPromises);
//   }

//   /**
//    * Smart upload with pre-processing WebP conversion
//    */
//   async smartWebPUpload(
//     file: Express.Multer.File, 
//     forceWebP: boolean = true,
//     maxSizeForConversion: number = 5 * 1024 * 1024, // 5MB
//     options?: {
//       quality?: number;
//       width?: number;
//       height?: number;
//       folder?: string;
//     }
//   ): Promise<UploadResponse> {
//     this.validateImageFile(file);

//     const fileExtension = file.originalname?.split('.').pop()?.toLowerCase();
//     const shouldConvertToWebP = forceWebP || 
//       (file.size <= maxSizeForConversion && fileExtension !== 'webp');

//     if (shouldConvertToWebP) {
//       return this.convertAndUploadAsWebP(file, {
//         ...options,
//         lossless: false,
//         effort: 4
//       });
//     } else {
//       // Upload as original format if WebP conversion is not beneficial
//       return this.uploadFile(file, true);
//     }
//   }

//   /**
//    * Create multiple WebP variants with different qualities and sizes
//    * All conversions happen before upload
//    */
//   async uploadWebPWithVariants(
//     file: Express.Multer.File,
//     variants: Array<{ 
//       suffix: string; 
//       quality: number; 
//       width?: number; 
//       height?: number; 
//       lossless?: boolean 
//     }> = [
//       { suffix: '_high', quality: 90, width: 1920 },
//       { suffix: '_medium', quality: 80, width: 1280 },
//       { suffix: '_low', quality: 70, width: 640 },
//       { suffix: '_thumb', quality: 60, width: 320 }
//     ]
//   ): Promise<UploadResponse[]> {
//     this.validateImageFile(file);

//     const baseFilename = file.originalname?.split('.')[0] || 'image';
    
//     const uploadPromises = variants.map(async (variant) => {
//       // Convert each variant locally before upload
//       const webpBuffer = await this.convertToWebP(file.buffer, {
//         quality: variant.quality,
//         width: variant.width,
//         height: variant.height,
//         lossless: variant.lossless || false,
//         effort: 4
//       });

//       // Create variant file object
//       const variantFile: Express.Multer.File = {
//         ...file,
//         buffer: webpBuffer,
//         mimetype: 'image/webp',
//         originalname: `${baseFilename}${variant.suffix}.webp`,
//         size: webpBuffer.length
//       };

//       return new Promise<UploadResponse>((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream(
//           {
//             folder: "nest-cloudinary-variants",
//             resource_type: "image",
//             format: "webp",
//             public_id: `${baseFilename}${variant.suffix}`,
//             quality: "auto:good",
//             flags: "progressive",
//           },
//           (error, result: any) => {
//             if (error) return reject(error)
//             resolve(result)
//           },
//         )

//         streamifier.createReadStream(variantFile.buffer).pipe(uploadStream)
//       })
//     });

//     return Promise.all(uploadPromises);
//   }

//   /**
//    * Advanced WebP conversion with custom Sharp transformations
//    */
//   async advancedWebPConversion(
//     file: Express.Multer.File,
//     transformations: {
//       resize?: { width?: number; height?: number; fit?: keyof sharp.FitEnum };
//       rotate?: number;
//       blur?: number;
//       sharpen?: boolean;
//       grayscale?: boolean;
//       quality?: number;
//       lossless?: boolean;
//       effort?: number;
//       folder?: string;
//     } = {}
//   ): Promise<UploadResponse> {
//     this.validateImageFile(file);

//     try {
//       let sharpInstance = sharp(file.buffer);

//       // Apply transformations
//       if (transformations.resize) {
//         sharpInstance = sharpInstance.resize(
//           transformations.resize.width,
//           transformations.resize.height,
//           {
//             fit: transformations.resize.fit || 'inside',
//             withoutEnlargement: true
//           }
//         );
//       }

//       if (transformations.rotate) {
//         sharpInstance = sharpInstance.rotate(transformations.rotate);
//       }

//       if (transformations.blur) {
//         sharpInstance = sharpInstance.blur(transformations.blur);
//       }

//       if (transformations.sharpen) {
//         sharpInstance = sharpInstance.sharpen();
//       }

//       if (transformations.grayscale) {
//         sharpInstance = sharpInstance.grayscale();
//       }

//       // Convert to WebP
//       const webpBuffer = await sharpInstance
//         .webp({
//           quality: transformations.quality || 80,
//           lossless: transformations.lossless || false,
//           effort: transformations.effort || 4,
//         })
//         .toBuffer();

//       // Upload the processed WebP
//       const processedFile: Express.Multer.File = {
//         ...file,
//         buffer: webpBuffer,
//         mimetype: 'image/webp',
//         originalname: file.originalname.replace(/\.[^/.]+$/, '.webp'),
//         size: webpBuffer.length
//       };

//       return new Promise<UploadResponse>((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream(
//           {
//             folder: transformations.folder || "nest-cloudinary-processed",
//             resource_type: "image",
//             format: "webp",
//             quality: "auto:good",
//             flags: "progressive",
//           },
//           (error, result: any) => {
//             if (error) return reject(error)
//             resolve(result)
//           },
//         )

//         streamifier.createReadStream(processedFile.buffer).pipe(uploadStream)
//       })
//     } catch (error) {
//       throw new BadRequestException(`Advanced WebP processing failed: ${error.message}`);
//     }
//   }

//   async deleteFile(publicId: string): Promise<any> {
//     return cloudinary.uploader.destroy(publicId)
//   }

//   /**
//    * Delete multiple files (useful for cleaning up variants)
//    */
//   async deleteMultipleFiles(publicIds: string[]): Promise<any[]> {
//     const deletePromises = publicIds.map(publicId => 
//       cloudinary.uploader.destroy(publicId)
//     );
//     return Promise.all(deletePromises);
//   }
// }


// @ts-nocheck
import { Injectable, BadRequestException } from "@nestjs/common"
import { v2 as cloudinary } from "cloudinary"
import type { UploadResponse } from "./upload-response"
import * as streamifier from "streamifier"
import sharp from "sharp"
import type { Express } from "express"

@Injectable()
export class UploadService {
  private readonly supportedImageFormats = [
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'ico', 'avif', 'heic', 'heif'
  ];

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

  async uploadFile(file: Express.Multer.File, optimizeForWeb = true): Promise<UploadResponse> {
    this.validateImageFile(file);

    // If optimizeForWeb is true, convert to WebP first
    if (optimizeForWeb) {
      return this.convertAndUploadAsWebP(file, {
        quality: 80,
        folder: "nest-cloudinary"
      });
    }

    // Original upload without WebP conversion
    return new Promise<UploadResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "nest-cloudinary",
          resource_type: "image",
          allowed_formats: this.supportedImageFormats,
          quality: "auto:good",
          flags: "progressive",
          format: "auto",
          fetch_format: "auto",
          dpr: "auto",
        },
        (error, result: any) => {
          if (error) return reject(error)
          resolve(result)
        },
      )

      streamifier.createReadStream(file.buffer).pipe(uploadStream)
    })
  }

  async uploadFiles(files: Express.Multer.File[], optimizeForWeb = true): Promise<UploadResponse[]> {
    // Validate all files first
    files.forEach(file => this.validateImageFile(file));

    // If optimizeForWeb is true, convert all to WebP
    if (optimizeForWeb) {
      return this.convertMultipleToWebP(files, {
        quality: 80,
        folder: "nest-cloudinary"
      });
    }

    // Original upload without WebP conversion
    const uploadPromises = files.map((file) => this.uploadFile(file, false))
    return Promise.all(uploadPromises)
  }

  async uploadFileAsWebP(file: Express.Multer.File): Promise<UploadResponse> {
    this.validateImageFile(file);

    return new Promise<UploadResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "nest-cloudinary",
          resource_type: "image",
          format: "webp",
          quality: "auto",
          fetch_format: "webp",
          flags: "progressive",
        },
        (error, result: any) => {
          if (error) return reject(error)
          resolve(result)
        },
      )

      streamifier.createReadStream(file.buffer).pipe(uploadStream)
    })
  }

  /**
   * Convert image buffer to WebP format using Sharp
   */
  private async convertToWebP(
    buffer: Buffer, 
    options: {
      quality?: number;
      width?: number;
      height?: number;
      lossless?: boolean;
      effort?: number;
    } = {}
  ): Promise<Buffer> {
    try {
      let sharpInstance = sharp(buffer);

      // Resize if dimensions provided
      if (options.width || options.height) {
        sharpInstance = sharpInstance.resize(options.width, options.height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Convert to WebP with specified options
      const webpOptions: sharp.WebpOptions = {
        quality: options.quality || 80,
        lossless: options.lossless || false,
        effort: options.effort || 4, // 0-6, higher = better compression
      };

      const webpBuffer = await sharpInstance
        .webp(webpOptions)
        .toBuffer();

      return webpBuffer;
    } catch (error) {
      throw new BadRequestException(`Failed to convert image to WebP: ${error.message}`);
    }
  }

  /**
   * Convert and upload image as WebP (conversion happens before upload)
   */
  async convertAndUploadAsWebP(
    file: Express.Multer.File, 
    options?: {
      quality?: number;
      width?: number;
      height?: number;
      lossless?: boolean;
      effort?: number;
      folder?: string;
    }
  ): Promise<UploadResponse> {
    this.validateImageFile(file);

    try {
      // Convert to WebP before uploading
      const webpBuffer = await this.convertToWebP(file.buffer, {
        quality: options?.quality,
        width: options?.width,
        height: options?.height,
        lossless: options?.lossless,
        effort: options?.effort
      });

      // Create a new file object with WebP buffer
      const webpFile: Express.Multer.File = {
        ...file,
        buffer: webpBuffer,
        mimetype: 'image/webp',
        originalname: file.originalname.replace(/\.[^/.]+$/, '.webp'),
        size: webpBuffer.length
      };

      return new Promise<UploadResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: options?.folder || "nest-cloudinary-webp",
            resource_type: "image",
            format: "webp",
            quality: "auto:good",
            flags: "progressive",
          },
          (error, result: any) => {
            if (error) return reject(error)
            resolve(result)
          },
        )

        streamifier.createReadStream(webpFile.buffer).pipe(uploadStream)
      })
    } catch (error) {
      throw new BadRequestException(`WebP conversion failed: ${error.message}`);
    }
  }

  /**
   * Batch convert multiple images to WebP before uploading
   */
  async convertMultipleToWebP(
    files: Express.Multer.File[], 
    options?: {
      quality?: number;
      width?: number;
      height?: number;
      lossless?: boolean;
      effort?: number;
      folder?: string;
    }
  ): Promise<UploadResponse[]> {
    // Validate all files first
    files.forEach(file => this.validateImageFile(file));

    const uploadPromises = files.map((file) => 
      this.convertAndUploadAsWebP(file, options)
    );
    
    return Promise.all(uploadPromises);
  }

  /**
   * Smart upload with pre-processing WebP conversion
   */
  async smartWebPUpload(
    file: Express.Multer.File, 
    forceWebP: boolean = true,
    maxSizeForConversion: number = 5 * 1024 * 1024, // 5MB
    options?: {
      quality?: number;
      width?: number;
      height?: number;
      folder?: string;
    }
  ): Promise<UploadResponse> {
    this.validateImageFile(file);

    const fileExtension = file.originalname?.split('.').pop()?.toLowerCase();
    const shouldConvertToWebP = forceWebP || 
      (file.size <= maxSizeForConversion && fileExtension !== 'webp');

    if (shouldConvertToWebP) {
      return this.convertAndUploadAsWebP(file, {
        ...options,
        lossless: false,
        effort: 4
      });
    } else {
      // Upload as original format if WebP conversion is not beneficial
      return this.uploadFile(file, true);
    }
  }

  /**
   * Create multiple WebP variants with different qualities and sizes
   * All conversions happen before upload
   */
  async uploadWebPWithVariants(
    file: Express.Multer.File,
    variants: Array<{ 
      suffix: string; 
      quality: number; 
      width?: number; 
      height?: number; 
      lossless?: boolean 
    }> = [
      { suffix: '_high', quality: 90, width: 1920 },
      { suffix: '_medium', quality: 80, width: 1280 },
      { suffix: '_low', quality: 70, width: 640 },
      { suffix: '_thumb', quality: 60, width: 320 }
    ]
  ): Promise<UploadResponse[]> {
    this.validateImageFile(file);

    const baseFilename = file.originalname?.split('.')[0] || 'image';
    
    const uploadPromises = variants.map(async (variant) => {
      // Convert each variant locally before upload
      const webpBuffer = await this.convertToWebP(file.buffer, {
        quality: variant.quality,
        width: variant.width,
        height: variant.height,
        lossless: variant.lossless || false,
        effort: 4
      });

      // Create variant file object
      const variantFile: Express.Multer.File = {
        ...file,
        buffer: webpBuffer,
        mimetype: 'image/webp',
        originalname: `${baseFilename}${variant.suffix}.webp`,
        size: webpBuffer.length
      };

      return new Promise<UploadResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "nest-cloudinary-variants",
            resource_type: "image",
            format: "webp",
            public_id: `${baseFilename}${variant.suffix}`,
            quality: "auto:good",
            flags: "progressive",
          },
          (error, result: any) => {
            if (error) return reject(error)
            resolve(result)
          },
        )

        streamifier.createReadStream(variantFile.buffer).pipe(uploadStream)
      })
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Advanced WebP conversion with custom Sharp transformations
   */
  async advancedWebPConversion(
    file: Express.Multer.File,
    transformations: {
      resize?: { width?: number; height?: number; fit?: keyof sharp.FitEnum };
      rotate?: number;
      blur?: number;
      sharpen?: boolean;
      grayscale?: boolean;
      quality?: number;
      lossless?: boolean;
      effort?: number;
      folder?: string;
    } = {}
  ): Promise<UploadResponse> {
    this.validateImageFile(file);

    try {
      let sharpInstance = sharp(file.buffer);

      // Apply transformations
      if (transformations.resize) {
        sharpInstance = sharpInstance.resize(
          transformations.resize.width,
          transformations.resize.height,
          {
            fit: transformations.resize.fit || 'inside',
            withoutEnlargement: true
          }
        );
      }

      if (transformations.rotate) {
        sharpInstance = sharpInstance.rotate(transformations.rotate);
      }

      if (transformations.blur) {
        sharpInstance = sharpInstance.blur(transformations.blur);
      }

      if (transformations.sharpen) {
        sharpInstance = sharpInstance.sharpen();
      }

      if (transformations.grayscale) {
        sharpInstance = sharpInstance.grayscale();
      }

      // Convert to WebP
      const webpBuffer = await sharpInstance
        .webp({
          quality: transformations.quality || 80,
          lossless: transformations.lossless || false,
          effort: transformations.effort || 4,
        })
        .toBuffer();

      // Upload the processed WebP
      const processedFile: Express.Multer.File = {
        ...file,
        buffer: webpBuffer,
        mimetype: 'image/webp',
        originalname: file.originalname.replace(/\.[^/.]+$/, '.webp'),
        size: webpBuffer.length
      };

      return new Promise<UploadResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: transformations.folder || "nest-cloudinary-processed",
            resource_type: "image",
            format: "webp",
            quality: "auto:good",
            flags: "progressive",
          },
          (error, result: any) => {
            if (error) return reject(error)
            resolve(result)
          },
        )

        streamifier.createReadStream(processedFile.buffer).pipe(uploadStream)
      })
    } catch (error) {
      throw new BadRequestException(`Advanced WebP processing failed: ${error.message}`);
    }
  }

  async deleteFile(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId)
  }

  /**
   * Delete multiple files (useful for cleaning up variants)
   */
  async deleteMultipleFiles(publicIds: string[]): Promise<any[]> {
    const deletePromises = publicIds.map(publicId => 
      cloudinary.uploader.destroy(publicId)
    );
    return Promise.all(deletePromises);
  }
}