import { Injectable, NotFoundException, Inject } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { Image, type ImageDocument } from "./schemas/image.schema"
import { UploadService } from "../upload/upload.service"
import type { CreateImageDto } from "./dto/create-image.dto"
import type { UpdateImageDto } from "./dto/update-image.dto"
import type { Express } from "express"

@Injectable()
export class ImagesService {
  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
    private uploadService: UploadService,
  ) {}

  async create(file: Express.Multer.File, createImageDto: CreateImageDto): Promise<Image> {
    const result = await this.uploadService.uploadFile(file)

    const newImage = new this.imageModel({
      name: createImageDto.name,
      description: createImageDto.description,
      tags: createImageDto.tags,
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
      format: result.format,
      width: result.width,
      height: result.height,
    })

    return newImage.save()
  }

  async createMany(files: Express.Multer.File[], createImageDto: CreateImageDto): Promise<Image[]> {
    const uploadResults = await this.uploadService.uploadFiles(files)

    const images = uploadResults.map((result, index) => {
      return new this.imageModel({
        name: `${createImageDto.name}-${index + 1}`,
        description: createImageDto.description,
        tags: createImageDto.tags,
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height,
      })
    })

    return this.imageModel.insertMany(images)
  }

  async findAll(): Promise<Image[]> {
    return this.imageModel.find().exec()
  }

  async findOne(id: string): Promise<Image> {
    const image = await this.imageModel.findById(id).exec()
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`)
    }
    return image
  }

  async update(id: string, updateImageDto: UpdateImageDto): Promise<Image> {
    const updatedImage = await this.imageModel.findByIdAndUpdate(id, updateImageDto, { new: true }).exec()

    if (!updatedImage) {
      throw new NotFoundException(`Image with ID ${id} not found`)
    }

    return updatedImage
  }

  async remove(id: string): Promise<void> {
    const image = await this.findOne(id)
    await this.uploadService.deleteFile(image.publicId)
    await this.imageModel.findByIdAndDelete(id).exec()
  }
}
