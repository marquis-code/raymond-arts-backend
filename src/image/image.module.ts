import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ImageController } from './controllers/image.controller';
import { ImageService } from './services/image.service';
import { CloudinaryService } from './services/cloudinary.service';
import { Image, ImageSchema } from './schemas/image.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 10, // Max 10 files for multiple upload
      },
      fileFilter: (req, file, callback) => {
        // Allow only image files
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Invalid file type. Only JPEG, PNG, JPG, and WebP are allowed.'), false);
        }
      },
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService, CloudinaryService],
  exports: [ImageService, CloudinaryService], // Export if needed in other modules
})
export class ImageModule {}