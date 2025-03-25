import { Injectable, BadRequestException } from "@nestjs/common"
import { v2 as cloudinary } from "cloudinary"
import type { CloudinaryResponse } from "./interfaces/cloudinary-response.interface"
import * as streamifier from "streamifier"
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
}

