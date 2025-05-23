import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Enquiry } from './schemas/enquiry.schema';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';

@Injectable()
export class EnquiriesService {

  constructor(
    @InjectModel(Enquiry.name) private enquiryModel: Model<Enquiry>,
  ){}

  async create(createEnquiryDto: CreateEnquiryDto): Promise<Enquiry> {
    const newEnquiry = new this.enquiryModel(createEnquiryDto);
    return newEnquiry.save();
  }

  async findAll(): Promise<Enquiry[]> {
    return this.enquiryModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Enquiry> {
    return this.enquiryModel.findById(id).exec();
  }

  async update(id: string, updateData: Partial<Enquiry>): Promise<Enquiry> {
    return this.enquiryModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Enquiry> {
    return this.enquiryModel.findByIdAndDelete(id).exec();
  }

  async markAsResolved(id: string): Promise<Enquiry> {
    return this.enquiryModel
      .findByIdAndUpdate(id, { isResolved: true }, { new: true })
      .exec();
  }
}