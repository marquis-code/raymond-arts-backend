// cloudinary.service.ts
import { Injectable, BadRequestException } from "@nestjs/common"
import { v2 as cloudinary } from "cloudinary"
import type { CloudinaryResponse } from "./interfaces/cloudinary-response.interface"
import * as streamifier from "streamifier"
import { Readable } from 'stream';
import type { Express } from "express"

@Injectable()
export class CloudinaryService {
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

  async uploadFile(file: Express.Multer.File, folder = "art-store"): Promise<CloudinaryResponse> {
    this.validateImageFile(file);

    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image", // Explicitly set to image for better handling
          allowed_formats: this.supportedImageFormats, // Explicitly allow all image formats
          format: "auto", // Let Cloudinary auto-detect format
          quality: "auto", // Optimize quality automatically
          fetch_format: "auto", // Auto-select best format for delivery
          flags: "progressive", // Enable progressive loading
        },
        (error, result) => {
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

  async generateImageUrl(publicId: string, options: any = {}): Promise<string> {
    // Default options that support modern formats
    const defaultOptions = {
      fetch_format: "auto",
      quality: "auto",
      ...options
    };
    
    return cloudinary.url(publicId, defaultOptions)
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    this.validateImageFile(file);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'nest-uploads',
          resource_type: "image",
          allowed_formats: this.supportedImageFormats,
          format: "auto",
          quality: "auto",
          fetch_format: "auto",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );
      
      const fileStream = Readable.from(file.buffer);
      fileStream.pipe(uploadStream);
    });
  }

  // Method to handle multiple image uploads
  async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    // Validate all files first
    files.forEach(file => this.validateImageFile(file));
    
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }

  // Method to convert image to WebP format specifically
  async uploadAndConvertToWebP(file: Express.Multer.File, folder = "art-store"): Promise<CloudinaryResponse> {
    this.validateImageFile(file);

    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          format: "webp", // Force conversion to WebP
          quality: "auto",
          fetch_format: "webp",
        },
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        },
      )

      streamifier.createReadStream(file.buffer).pipe(uploadStream)
    })
  }
}