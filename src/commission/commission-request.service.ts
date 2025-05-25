// src/services/commission-request.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommissionRequest, CommissionRequestDocument } from './schemas/commission-request.schema';
import { CreateCommissionRequestDto } from './dto/create-commission-request.dto';
import { UpdateCommissionRequestDto } from './dto/update-commission-request.dto';
import { DrawingTypeService } from './drawing-type.service';

@Injectable()
export class CommissionRequestService {
  constructor(
    @InjectModel(CommissionRequest.name) private commissionRequestModel: Model<CommissionRequestDocument>,
    private drawingTypeService: DrawingTypeService,
  ) {}

  async create(createCommissionRequestDto: CreateCommissionRequestDto): Promise<CommissionRequest> {
    // Validate drawing type exists
    await this.drawingTypeService.findOne(createCommissionRequestDto.drawingType);

    const commissionData = {
      ...createCommissionRequestDto,
      deadline: createCommissionRequestDto.deadline ? new Date(createCommissionRequestDto.deadline) : undefined,
    };

    const createdCommission = new this.commissionRequestModel(commissionData);
    return createdCommission.save();
  }


  async findAll(page: number = 1, limit: number = 10): Promise<{
    commissions: CommissionRequest[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [commissions, total] = await Promise.all([
      this.commissionRequestModel
        .find()
        .populate('drawingType', 'name description')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.commissionRequestModel.countDocuments().exec(),
    ]);

    return {
      commissions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<CommissionRequest> {
    const commission = await this.commissionRequestModel
      .findById(id)
      .populate('drawingType', 'name description')
      .exec();
    
    if (!commission) {
      throw new NotFoundException(`Commission request with ID ${id} not found`);
    }
    return commission;
  }

  async update(id: string, updateCommissionRequestDto: UpdateCommissionRequestDto): Promise<CommissionRequest> {
    // If drawingType is being updated, validate it exists
    if (updateCommissionRequestDto.drawingType) {
      await this.drawingTypeService.findOne(updateCommissionRequestDto.drawingType);
    }

    const updateData = {
      ...updateCommissionRequestDto,
      deadline: updateCommissionRequestDto.deadline ? new Date(updateCommissionRequestDto.deadline) : undefined,
    };

    const updatedCommission = await this.commissionRequestModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('drawingType', 'name description')
      .exec();
    
    if (!updatedCommission) {
      throw new NotFoundException(`Commission request with ID ${id} not found`);
    }
    return updatedCommission;
  }


  async remove(id: string): Promise<void> {
    const result = await this.commissionRequestModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Commission request with ID ${id} not found`);
    }
  }

  async findByStatus(status: string): Promise<CommissionRequest[]> {
    return this.commissionRequestModel
      .find({ status })
      .populate('drawingType', 'name description')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByEmail(email: string): Promise<CommissionRequest[]> {
    return this.commissionRequestModel
      .find({ email })
      .populate('drawingType', 'name description')
      .sort({ createdAt: -1 })
      .exec();
  }
}