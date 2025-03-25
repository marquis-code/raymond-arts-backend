import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { Contact } from "./schemas/contact.schema"
import type { CreateContactDto } from "./dto/create-contact.dto"
import type { UpdateContactDto } from "./dto/update-contact.dto"
import type { AddInteractionDto } from "./dto/add-interaction.dto"
import type { PaginationParams, PaginatedResult } from "../common/interfaces/pagination.interface"
import type { AuditService } from "../audit/audit.service"

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<Contact>,
    private auditService: AuditService,
  ) {}

  async create(createContactDto: CreateContactDto, userId: string): Promise<Contact> {
    // Check if contact with email already exists
    const existingContact = await this.contactModel.findOne({ email: createContactDto.email }).exec()
    if (existingContact) {
      throw new ConflictException("Contact with this email already exists")
    }

    const newContact = new this.contactModel({
      ...createContactDto,
      createdBy: userId,
    })

    const savedContact = await newContact.save()

    // Log audit
    await this.auditService.createAuditLog({
      action: "CREATE",
      userId,
      module: "CONTACTS",
      description: `Contact created: ${savedContact.firstName} ${savedContact.lastName}`,
    })

    return savedContact
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Contact>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc", search } = params
    const skip = (page - 1) * limit

    // Build query
    let query = {}
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ],
      }
    }

    // Execute query
    const [contacts, total] = await Promise.all([
      this.contactModel
        .find(query)
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "firstName lastName email")
        .exec(),
      this.contactModel.countDocuments(query).exec(),
    ])

    return {
      data: contacts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findByUser(userId: string, params: PaginationParams): Promise<PaginatedResult<Contact>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc", search } = params
    const skip = (page - 1) * limit

    // Build query
    let query: any = { createdBy: userId }
    if (search) {
      query = {
        ...query,
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ],
      }
    }

    // Execute query
    const [contacts, total] = await Promise.all([
      this.contactModel
        .find(query)
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.contactModel.countDocuments(query).exec(),
    ])

    return {
      data: contacts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactModel.findById(id).populate("createdBy", "firstName lastName email").exec()

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`)
    }

    return contact
  }

  async update(id: string, updateContactDto: UpdateContactDto, userId: string): Promise<Contact> {
    // Check if contact exists
    const contact = await this.findOne(id)

    // Check if email is being updated and if it already exists
    if (updateContactDto.email && updateContactDto.email !== contact.email) {
      const existingContact = await this.contactModel
        .findOne({
          email: updateContactDto.email,
          _id: { $ne: id },
        })
        .exec()

      if (existingContact) {
        throw new ConflictException("Contact with this email already exists")
      }
    }

    const updatedContact = await this.contactModel.findByIdAndUpdate(id, updateContactDto, { new: true }).exec()

    // Log audit
    await this.auditService.createAuditLog({
      action: "UPDATE",
      userId,
      module: "CONTACTS",
      description: `Contact updated: ${contact.firstName} ${contact.lastName}`,
      changes: JSON.stringify(updateContactDto),
    })

    return updatedContact
  }

  async remove(id: string, userId: string): Promise<Contact> {
    const contact = await this.findOne(id)

    const deletedContact = await this.contactModel.findByIdAndDelete(id).exec()

    // Log audit
    await this.auditService.createAuditLog({
      action: "DELETE",
      userId,
      module: "CONTACTS",
      description: `Contact deleted: ${contact.firstName} ${contact.lastName}`,
    })

    return deletedContact
  }

  async addInteraction(id: string, addInteractionDto: AddInteractionDto, userId: string): Promise<Contact> {
    const contact = await this.findOne(id)

    // Add interaction
    if (!contact.interactions) {
      contact.interactions = []
    }

    contact.interactions.push({
      date: new Date(addInteractionDto.date),
      type: addInteractionDto.type,
      notes: addInteractionDto.notes,
      userId,
    })

    const updatedContact = await contact.save()

    // Log audit
    await this.auditService.createAuditLog({
      action: "ADD_INTERACTION",
      userId,
      module: "CONTACTS",
      description: `Interaction added for contact: ${contact.firstName} ${contact.lastName}`,
      changes: JSON.stringify(addInteractionDto),
    })

    return updatedContact
  }

  async findByTag(tag: string, params: PaginationParams): Promise<PaginatedResult<Contact>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
    const skip = (page - 1) * limit

    const [contacts, total] = await Promise.all([
      this.contactModel
        .find({ tags: { $in: [tag] } })
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "firstName lastName email")
        .exec(),
      this.contactModel.countDocuments({ tags: { $in: [tag] } }).exec(),
    ])

    return {
      data: contacts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getAllTags(): Promise<string[]> {
    const result = await this.contactModel
      .aggregate([{ $unwind: "$tags" }, { $group: { _id: "$tags" } }, { $sort: { _id: 1 } }])
      .exec()

    return result.map((item) => item._id)
  }
}

