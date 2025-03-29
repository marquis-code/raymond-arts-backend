// import { Injectable } from "@nestjs/common"
// import { InjectModel } from "@nestjs/mongoose"
// import type { Model } from "mongoose"
// import { Audit } from "./schemas/audit.schema"
// import type { CreateAuditDto } from "./dto/create-audit.dto"
// import type { PaginationParams, PaginatedResult } from "../common/interfaces/pagination.interface"

// @Injectable()
// export class AuditService {
//   constructor(
//     @InjectModel(Audit.name) private auditModel: Model<Audit>,
//   ) {}

//   async createAuditLog(createAuditDto: CreateAuditDto): Promise<Audit> {
//     const newAudit = new this.auditModel(createAuditDto)
//     return newAudit.save()
//   }

//   async findAll(params: PaginationParams): Promise<PaginatedResult<Audit>> {
//     const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
//     const skip = (page - 1) * limit

//     const [audits, total] = await Promise.all([
//       this.auditModel
//         .find()
//         .sort({ [sort]: order === "asc" ? 1 : -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("userId", "firstName lastName email")
//         .exec(),
//       this.auditModel.countDocuments().exec(),
//     ])

//     return {
//       data: audits,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     }
//   }

//   async findByUser(userId: string, params: PaginationParams): Promise<PaginatedResult<Audit>> {
//     const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
//     const skip = (page - 1) * limit

//     const [audits, total] = await Promise.all([
//       this.auditModel
//         .find({ userId })
//         .sort({ [sort]: order === "asc" ? 1 : -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("userId", "firstName lastName email")
//         .exec(),
//       this.auditModel.countDocuments({ userId }).exec(),
//     ])

//     return {
//       data: audits,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     }
//   }

//   async findByModule(module: string, params: PaginationParams): Promise<PaginatedResult<Audit>> {
//     const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
//     const skip = (page - 1) * limit

//     const [audits, total] = await Promise.all([
//       this.auditModel
//         .find({ module })
//         .sort({ [sort]: order === "asc" ? 1 : -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("userId", "firstName lastName email")
//         .exec(),
//       this.auditModel.countDocuments({ module }).exec(),
//     ])

//     return {
//       data: audits,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     }
//   }
// }


import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { Audit } from "./schemas/audit.schema"
import type { CreateAuditDto } from "./dto/create-audit.dto"
import type { PaginationParams, PaginatedResult } from "../common/interfaces/pagination.interface"

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(Audit.name) private auditModel: Model<Audit>,
  ) {}

  async createAuditLog(createAuditDto: CreateAuditDto): Promise<Audit> {
    const newAudit = new this.auditModel(createAuditDto)
    return newAudit.save()
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Audit>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
    const skip = (page - 1) * limit

    const [audits, total] = await Promise.all([
      this.auditModel
        .find()
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName email")
        .exec(),
      this.auditModel.countDocuments().exec(),
    ])

    return {
      data: audits,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findByUser(userId: string, params: PaginationParams): Promise<PaginatedResult<Audit>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
    const skip = (page - 1) * limit

    const [audits, total] = await Promise.all([
      this.auditModel
        .find({ userId })
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName email")
        .exec(),
      this.auditModel.countDocuments({ userId }).exec(),
    ])

    return {
      data: audits,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findByModule(module: string, params: PaginationParams): Promise<PaginatedResult<Audit>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
    const skip = (page - 1) * limit

    const [audits, total] = await Promise.all([
      this.auditModel
        .find({ module })
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName email")
        .exec(),
      this.auditModel.countDocuments({ module }).exec(),
    ])

    return {
      data: audits,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}

