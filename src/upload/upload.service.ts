// import { Injectable, BadRequestException } from "@nestjs/common"
// import { v2 as cloudinary } from "cloudinary"
// import type { UploadResponse } from "./upload-response"
// import * as streamifier from "streamifier"
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

//   async uploadFile(file: Express.Multer.File): Promise<UploadResponse> {
//     this.validateImageFile(file);

//     return new Promise<UploadResponse>((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           folder: "nest-cloudinary",
//           resource_type: "image", // Explicitly set to image
//           allowed_formats: this.supportedImageFormats, // Allow all supported formats
//           format: "auto", // Auto-detect format
//           quality: "auto", // Optimize quality automatically
//           fetch_format: "auto", // Auto-select best format for delivery
//           flags: "progressive", // Enable progressive loading
//         },
//         (error, result: any) => {
//           if (error) return reject(error)
//           resolve(result)
//         },
//       )

//       streamifier.createReadStream(file.buffer).pipe(uploadStream)
//     })
//   }

//   async uploadFiles(files: Express.Multer.File[]): Promise<UploadResponse[]> {
//     // Validate all files first
//     files.forEach(file => this.validateImageFile(file));

//     const uploadPromises = files.map((file) => this.uploadFile(file))
//     return Promise.all(uploadPromises)
//   }

//   async uploadFileAsWebP(file: Express.Multer.File): Promise<UploadResponse> {
//     this.validateImageFile(file);

//     return new Promise<UploadResponse>((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           folder: "nest-cloudinary",
//           resource_type: "image",
//           format: "webp", // Force conversion to WebP
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

//   async deleteFile(publicId: string): Promise<any> {
//     return cloudinary.uploader.destroy(publicId)
//   }
// }

// import { Injectable, BadRequestException } from "@nestjs/common"
// import { v2 as cloudinary } from "cloudinary"
// import type { UploadResponse } from "./upload-response"
// import * as streamifier from "streamifier"
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

//   async uploadFile(file: Express.Multer.File): Promise<UploadResponse> {
//     this.validateImageFile(file);

//     return new Promise<UploadResponse>((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           folder: "nest-cloudinary",
//           resource_type: "image", // Explicitly set to image
//           allowed_formats: this.supportedImageFormats, // Allow all supported formats
//           format: "webp", // Convert all uploads to WebP
//           quality: "auto", // Optimize quality automatically
//           fetch_format: "webp", // Deliver as WebP
//           flags: "progressive", // Enable progressive loading
//         },
//         (error, result: any) => {
//           if (error) return reject(error)
//           resolve(result)
//         },
//       )

//       streamifier.createReadStream(file.buffer).pipe(uploadStream)
//     })
//   }

//   async uploadFiles(files: Express.Multer.File[]): Promise<UploadResponse[]> {
//     // Validate all files first
//     files.forEach(file => this.validateImageFile(file));

//     const uploadPromises = files.map((file) => this.uploadFile(file))
//     return Promise.all(uploadPromises)
//   }

//   async uploadFileAsWebP(file: Express.Multer.File): Promise<UploadResponse> {
//     this.validateImageFile(file);

//     return new Promise<UploadResponse>((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           folder: "nest-cloudinary",
//           resource_type: "image",
//           format: "webp", // Force conversion to WebP
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

//   async deleteFile(publicId: string): Promise<any> {
//     return cloudinary.uploader.destroy(publicId)
//   }
// }


// import { Injectable, BadRequestException } from "@nestjs/common"
// import { v2 as cloudinary } from "cloudinary"
// import type { UploadResponse } from "./upload-response"
// import * as streamifier from "streamifier"
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
//       const uploadOptions = {
//         folder: "nest-cloudinary",
//         resource_type: "image",
//         allowed_formats: this.supportedImageFormats,
//         quality: "auto:good", // Better quality optimization
//         flags: "progressive",
//       };

//       if (optimizeForWeb) {
//         // Store original but optimize for web delivery
//         uploadOptions['format'] = "auto"; // Keep original for storage
//         uploadOptions['fetch_format'] = "auto"; // Auto-select best delivery format (WebP/AVIF when supported)
//         uploadOptions['quality'] = "auto:good"; // Good quality with optimization
//         uploadOptions['dpr'] = "auto"; // Auto device pixel ratio
//       } else {
//         uploadOptions['format'] = "auto";
//         uploadOptions['fetch_format'] = "auto";
//       }

//       const uploadStream = cloudinary.uploader.upload_stream(
//         uploadOptions,
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
//           format: "webp", // Force conversion to WebP
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

//   async deleteFile(publicId: string): Promise<any> {
//     return cloudinary.uploader.destroy(publicId)
//   }
// }


// import { Injectable, BadRequestException } from "@nestjs/common"
// import { v2 as cloudinary } from "cloudinary"
// import type { UploadResponse } from "./upload-response"
// import * as streamifier from "streamifier"
// import type { Express } from "express"

// // @ts-nocheck
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
//       const uploadOptions = {
//         folder: "nest-cloudinary",
//         resource_type: "image",
//         allowed_formats: this.supportedImageFormats,
//         quality: "auto:good", // Better quality optimization
//         flags: "progressive",
//       };

//       if (optimizeForWeb) {
//         // Store original but optimize for web delivery
//         uploadOptions['format'] = "auto"; // Keep original for storage
//         uploadOptions['fetch_format'] = "auto"; // Auto-select best delivery format (WebP/AVIF when supported)
//         uploadOptions['quality'] = "auto:good"; // Good quality with optimization
//         uploadOptions['dpr'] = "auto"; // Auto device pixel ratio
//       } else {
//         uploadOptions['format'] = "auto";
//         uploadOptions['fetch_format'] = "auto";
//       }

//       const uploadStream = cloudinary.uploader.upload_stream(
//         uploadOptions,
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
//         } as any, // FORCE TYPESCRIPT TO ACCEPT THIS
//         (error, result: any) => {
//           if (error) return reject(error)
//           resolve(result)
//         },
//       )

//       streamifier.createReadStream(file.buffer).pipe(uploadStream)
//     })
//   }

//   async deleteFile(publicId: string): Promise<any> {
//     return cloudinary.uploader.destroy(publicId)
//   }
// }



// @ts-nocheck
import { Injectable, BadRequestException } from "@nestjs/common"
import { v2 as cloudinary } from "cloudinary"
import type { UploadResponse } from "./upload-response"
import * as streamifier from "streamifier"
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

    const uploadPromises = files.map((file) => this.uploadFile(file, optimizeForWeb))
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

  async deleteFile(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId)
  }
}