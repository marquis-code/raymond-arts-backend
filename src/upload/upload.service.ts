import { Injectable } from "@nestjs/common"
import { v2 as cloudinary } from "cloudinary"
import type { UploadResponse } from "./upload-response"
import * as streamifier from "streamifier"
import type { Express } from "express"

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File): Promise<UploadResponse> {
    return new Promise<UploadResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "nest-cloudinary",
        },
        (error, result:any) => {
          if (error) return reject(error)
          resolve(result)
        },
      )

      streamifier.createReadStream(file.buffer).pipe(uploadStream)
    })
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<UploadResponse[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file))
    return Promise.all(uploadPromises)
  }

  async deleteFile(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId)
  }
}
