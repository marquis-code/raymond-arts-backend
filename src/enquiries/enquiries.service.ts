import { Injectable, Logger } from "@nestjs/common"
import { Model } from "mongoose"
import { CreateEnquiryDto } from "./dto/create-enquiry.dto"
import { UpdateEnquiryDto } from "./dto/update-enquiry.dto"
import { Enquiry } from "./schemas/enquiry.schema"
import { InjectModel } from "@nestjs/mongoose"

@Injectable()
export class EnquiriesService {
  private readonly logger = new Logger(EnquiriesService.name)

  constructor(@InjectModel(Enquiry.name) private readonly enquiryModel: Model<Enquiry>) {}

  async create(createEnquiryDto: CreateEnquiryDto): Promise<Enquiry> {
    try {
      this.logger.log("Creating enquiry with data:", createEnquiryDto)

      const enquiry = new this.enquiryModel({
        ...createEnquiryDto,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const savedEnquiry = await enquiry.save()
      this.logger.log("Enquiry saved successfully:", savedEnquiry._id)

      return savedEnquiry
    } catch (error) {
      this.logger.error("Error creating enquiry:", error.message, error.stack)
      throw error
    }
  }

  async findAll(options: {
    page: number
    limit: number
    status?: string
    search?: string
  }): Promise<{ enquiries: Enquiry[]; total: number }> {
    const { page, limit, status, search } = options
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (status) {
      query.status = status
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ]
    }

    const [enquiries, total] = await Promise.all([
      this.enquiryModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.enquiryModel.countDocuments(query).exec(),
    ])

    return { enquiries, total }
  }

  async findOne(id: string): Promise<Enquiry | null> {
    return this.enquiryModel.findById(id).exec()
  }

  async update(id: string, updateEnquiryDto: UpdateEnquiryDto): Promise<Enquiry | null> {
    return this.enquiryModel
      .findByIdAndUpdate(id, { ...updateEnquiryDto, updatedAt: new Date() }, { new: true, runValidators: true })
      .exec()
  }

  async remove(id: string): Promise<Enquiry | null> {
    return this.enquiryModel.findByIdAndDelete(id).exec()
  }

  async updateStatus(id: string, status: string, adminNotes?: string): Promise<Enquiry | null> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes
    }

    return this.enquiryModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec()
  }
}
