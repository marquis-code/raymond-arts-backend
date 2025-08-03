import { Injectable, NotFoundException } from "@nestjs/common"
import { Model } from "mongoose"
import { InjectModel } from "@nestjs/mongoose" // Import InjectModel
import { OriginalDocument } from "./schemas/original.schema"
import { CreateOriginalDto } from "./dto/create-original.dto"
import { UpdateOriginalDto } from "./dto/update-original.dto"
import { ReorderOriginalItemDto } from "./dto/reorder-original.dto" // Import the new DTO

@Injectable()
export class OriginalsService {
  private originalModel: Model<OriginalDocument>

  constructor(@InjectModel("Originals") originalModel: Model<OriginalDocument>) {
    this.originalModel = originalModel
  } // Use InjectModel

  async create(createOriginalDto: CreateOriginalDto): Promise<OriginalDocument> {
    // Find the maximum current position and set the new item's position
    const maxPositionOriginal = await this.originalModel.findOne().sort({ position: -1 }).exec()
    const newPosition = maxPositionOriginal ? maxPositionOriginal.position + 1 : 0

    const createdOriginal = new this.originalModel({
      ...createOriginalDto,
      position: newPosition,
    })
    return createdOriginal.save()
  }

  async findAll(): Promise<OriginalDocument[]> {
    return this.originalModel.find().sort({ position: 1 }).exec() // Sort by position
  }

  async findOne(id: string): Promise<OriginalDocument> {
    const original = await this.originalModel.findById(id).exec()
    if (!original) {
      throw new NotFoundException(`Original with ID "${id}" not found`)
    }
    return original
  }

  async update(id: string, updateOriginalDto: UpdateOriginalDto): Promise<OriginalDocument> {
    const existingOriginal = await this.originalModel.findByIdAndUpdate(id, updateOriginalDto, { new: true }).exec()
    if (!existingOriginal) {
      throw new NotFoundException(`Original with ID "${id}" not found`)
    }
    return existingOriginal
  }

  async remove(id: string): Promise<OriginalDocument> {
    const deletedOriginal = await this.originalModel.findByIdAndDelete(id).exec()
    if (!deletedOriginal) {
      throw new NotFoundException(`Original with ID "${id}" not found`)
    }
    return deletedOriginal
  }

  async updateOrder(reorderData: ReorderOriginalItemDto[]): Promise<void> {
    const bulkOperations = reorderData.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { position: item.position } },
      },
    }))

    await this.originalModel.bulkWrite(bulkOperations)
  }
}
