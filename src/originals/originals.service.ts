// import { Injectable, NotFoundException } from "@nestjs/common"
// import { Model } from "mongoose"
// import { InjectModel } from "@nestjs/mongoose" // Import InjectModel
// import { OriginalDocument } from "./schemas/original.schema"
// import { CreateOriginalDto } from "./dto/create-original.dto"
// import { UpdateOriginalDto } from "./dto/update-original.dto"
// import { ReorderOriginalItemDto } from "./dto/reorder-original.dto" // Import the new DTO

// @Injectable()
// export class OriginalsService {
//   private originalModel: Model<OriginalDocument>

//   constructor(@InjectModel("Originals") originalModel: Model<OriginalDocument>) {
//     this.originalModel = originalModel
//   } // Use InjectModel

//   async create(createOriginalDto: CreateOriginalDto): Promise<OriginalDocument> {
//     // Find the maximum current position and set the new item's position
//     const maxPositionOriginal = await this.originalModel.findOne().sort({ position: -1 }).exec()
//     const newPosition = maxPositionOriginal ? maxPositionOriginal.position + 1 : 0

//     const createdOriginal = new this.originalModel({
//       ...createOriginalDto,
//       position: newPosition,
//     })
//     return createdOriginal.save()
//   }

//   async findAll(): Promise<OriginalDocument[]> {
//     return this.originalModel.find().sort({ position: 1 }).exec() // Sort by position
//   }

//   async findOne(id: string): Promise<OriginalDocument> {
//     const original = await this.originalModel.findById(id).exec()
//     if (!original) {
//       throw new NotFoundException(`Original with ID "${id}" not found`)
//     }
//     return original
//   }

//   async update(id: string, updateOriginalDto: UpdateOriginalDto): Promise<OriginalDocument> {
//     const existingOriginal = await this.originalModel.findByIdAndUpdate(id, updateOriginalDto, { new: true }).exec()
//     if (!existingOriginal) {
//       throw new NotFoundException(`Original with ID "${id}" not found`)
//     }
//     return existingOriginal
//   }

//   async remove(id: string): Promise<OriginalDocument> {
//     const deletedOriginal = await this.originalModel.findByIdAndDelete(id).exec()
//     if (!deletedOriginal) {
//       throw new NotFoundException(`Original with ID "${id}" not found`)
//     }
//     return deletedOriginal
//   }

//   async updateOrder(reorderData: ReorderOriginalItemDto[]): Promise<void> {
//     const bulkOperations = reorderData.map((item) => ({
//       updateOne: {
//         filter: { _id: item.id },
//         update: { $set: { position: item.position } },
//       },
//     }))

//     await this.originalModel.bulkWrite(bulkOperations)
//   }
// }

import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { OriginalDocument } from './schemas/original.schema';
import { CreateOriginalDto } from './dto/create-original.dto';
import { UpdateOriginalDto } from './dto/update-original.dto';
import { ReorderOriginalItemDto } from './dto/reorder-original.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class OriginalsService {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_PREFIX = 'originals';
  private originalModel: Model<OriginalDocument>;

  constructor(
    @InjectModel('Originals') originalModel: Model<OriginalDocument>,
    private readonly redisService: RedisService,
  ) {
    this.originalModel = originalModel;
  }

  async create(
    createOriginalDto: CreateOriginalDto,
  ): Promise<OriginalDocument> {
    // Find the maximum current position and set the new item's position
    const maxPositionOriginal = await this.originalModel
      .findOne()
      .sort({ position: -1 })
      .exec();
    const newPosition = maxPositionOriginal
      ? maxPositionOriginal.position + 1
      : 0;

    const createdOriginal = new this.originalModel({
      ...createOriginalDto,
      position: newPosition,
    });

    const result = await createdOriginal.save();

    await this.invalidateOriginalsCache();

    return result;
  }

  async findAll(): Promise<OriginalDocument[]> {
    const cacheKey = `${this.CACHE_PREFIX}:all`;

    try {
      const cached = await this.redisService.get<OriginalDocument[]>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn('Redis cache error in findAll:', error);
    }

    const originals = await this.originalModel
      .find()
      .sort({ position: 1 })
      .exec();

    try {
      await this.redisService.set(cacheKey, originals, this.CACHE_TTL);
    } catch (error) {
      console.warn('Redis cache set error in findAll:', error);
    }

    return originals;
  }

  async findOne(id: string): Promise<OriginalDocument> {
    const cacheKey = `${this.CACHE_PREFIX}:${id}`;

    try {
      const cached = await this.redisService.get<OriginalDocument>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn('Redis cache error in findOne:', error);
    }

    const original = await this.originalModel.findById(id).exec();
    if (!original) {
      throw new NotFoundException(`Original with ID "${id}" not found`);
    }

    try {
      await this.redisService.set(cacheKey, original, this.CACHE_TTL);
    } catch (error) {
      console.warn('Redis cache set error in findOne:', error);
    }

    return original;
  }

  async update(
    id: string,
    updateOriginalDto: UpdateOriginalDto,
  ): Promise<OriginalDocument> {
    const existingOriginal = await this.originalModel
      .findByIdAndUpdate(id, updateOriginalDto, { new: true })
      .exec();
    if (!existingOriginal) {
      throw new NotFoundException(`Original with ID "${id}" not found`);
    }

    await this.invalidateOriginalCache(id);
    await this.invalidateOriginalsCache();

    return existingOriginal;
  }

  async remove(id: string): Promise<OriginalDocument> {
    const deletedOriginal = await this.originalModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedOriginal) {
      throw new NotFoundException(`Original with ID "${id}" not found`);
    }

    await this.invalidateOriginalCache(id);
    await this.invalidateOriginalsCache();

    return deletedOriginal;
  }

  async updateOrder(reorderData: ReorderOriginalItemDto[]): Promise<void> {
    const bulkOperations = reorderData.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { position: item.position } },
      },
    }));

    await this.originalModel.bulkWrite(bulkOperations);

    await this.invalidateAllOriginalsCache(reorderData.map((item) => item.id));
  }

  private async invalidateOriginalCache(id: string): Promise<void> {
    try {
      await this.redisService.del(`${this.CACHE_PREFIX}:${id}`);
    } catch (error) {
      console.warn('Redis cache delete error:', error);
    }
  }

  private async invalidateOriginalsCache(): Promise<void> {
    try {
      await this.redisService.del(`${this.CACHE_PREFIX}:all`);
    } catch (error) {
      console.warn('Redis cache delete error:', error);
    }
  }

  private async invalidateAllOriginalsCache(ids: string[]): Promise<void> {
    try {
      // Invalidate individual original caches
      const deletePromises = ids.map((id) => this.invalidateOriginalCache(id));
      await Promise.all(deletePromises);

      // Invalidate the all originals cache
      await this.invalidateOriginalsCache();
    } catch (error) {
      console.warn('Redis bulk cache delete error:', error);
    }
  }
}
