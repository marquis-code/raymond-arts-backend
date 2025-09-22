import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(filePath: string, folder: string = 'uploads'): Promise<any> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'auto',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto:good' },
          { format: 'auto' }
        ]
      });
      
      this.logger.log(`Image uploaded successfully: ${result.public_id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to upload image: ${error.message}`, error.stack);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadImageBuffer(
    buffer: Buffer, 
    folder: string = 'uploads',
    options: any = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder,
        resource_type: 'auto',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto:good' },
          { format: 'auto' }
        ],
        ...options
      };

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            this.logger.error(`Failed to upload image buffer: ${error.message}`, error.stack);
            reject(new Error(`Failed to upload image: ${error.message}`));
          } else {
            this.logger.log(`Image uploaded successfully: ${result.public_id}`);
            resolve(result);
          }
        }
      ).end(buffer);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Image deleted successfully: ${publicId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete image: ${error.message}`, error.stack);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  async getImageDetails(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get image details: ${error.message}`, error.stack);
      throw new Error(`Failed to get image details: ${error.message}`);
    }
  }
}