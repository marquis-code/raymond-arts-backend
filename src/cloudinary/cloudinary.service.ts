import { Injectable, BadRequestException } from "@nestjs/common"
import { v2 as cloudinary } from "cloudinary"
import type { CloudinaryResponse } from "./interfaces/cloudinary-response.interface"
import * as streamifier from "streamifier"
import { Readable } from 'stream';
import type { Express } from "express"

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File, folder = "art-store"): Promise<CloudinaryResponse> {
    if (!file) {
      throw new BadRequestException("File is required")
    }

    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
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
    return cloudinary.url(publicId, options)
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'nest-uploads',
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
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }
}
