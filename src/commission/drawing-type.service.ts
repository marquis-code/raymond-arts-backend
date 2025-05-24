
// src/services/drawing-type.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DrawingType, DrawingTypeDocument } from './schemas/drawing-type.schema';
import { CreateDrawingTypeDto } from './dto/create-drawing-type.dto';
import { UpdateDrawingTypeDto } from './dto/update-drawing-type.dto';

@Injectable()
export class DrawingTypeService {
  constructor(
    @InjectModel(DrawingType.name) private drawingTypeModel: Model<DrawingTypeDocument>,
  ) {}

  async create(createDrawingTypeDto: CreateDrawingTypeDto): Promise<DrawingType> {
    const createdDrawingType = new this.drawingTypeModel(createDrawingTypeDto);
    return createdDrawingType.save();
  }

  async findAll(): Promise<DrawingType[]> {
    return this.drawingTypeModel
      .find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async findOne(id: string): Promise<DrawingType> {
    const drawingType = await this.drawingTypeModel.findById(id).exec();
    if (!drawingType) {
      throw new NotFoundException(`Drawing type with ID ${id} not found`);
    }
    return drawingType;
  }

  async update(id: string, updateDrawingTypeDto: UpdateDrawingTypeDto): Promise<DrawingType> {
    const updatedDrawingType = await this.drawingTypeModel
      .findByIdAndUpdate(id, updateDrawingTypeDto, { new: true })
      .exec();
    
    if (!updatedDrawingType) {
      throw new NotFoundException(`Drawing type with ID ${id} not found`);
    }
    return updatedDrawingType;
  }

  async remove(id: string): Promise<void> {
    const result = await this.drawingTypeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Drawing type with ID ${id} not found`);
    }
  }

  async seedDefaultTypes(): Promise<void> {
    const defaultTypes = [
      { name: 'Personal Portrait', sortOrder: 1 },
      { name: 'Couple Portrait', sortOrder: 2 },
      { name: 'Family Portrait', sortOrder: 3 },
      { name: 'Pet', sortOrder: 4 },
      { name: 'Others', sortOrder: 5 },
    ];

    for (const type of defaultTypes) {
      const existing = await this.drawingTypeModel.findOne({ name: type.name }).exec();
      if (!existing) {
        await this.create(type);
      }
    }
  }
}