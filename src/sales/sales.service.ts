import { Injectable, NotFoundException, forwardRef, Inject } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { Sale } from "./schemas/sale.schema"
import type { CreateSaleDto } from "./dto/create-sale.dto"
import type { UpdateSaleDto } from "./dto/update-sale.dto"
import type { PaginationParams, PaginatedResult } from "../common/interfaces/pagination.interface"
import { AuditService } from "../audit/audit.service"

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<Sale>,
    @Inject(forwardRef(() => AuditService)) private auditService: AuditService,
  ) {}

  async create(createSaleDto: CreateSaleDto, userId: string): Promise<Sale> {
    const newSale = new this.saleModel({
      ...createSaleDto,
      date: createSaleDto.date ? new Date(createSaleDto.date) : new Date(),
    })

    const savedSale = await newSale.save()

    // Log audit
    await this.auditService.createAuditLog({
      action: "CREATE",
      userId,
      module: "SALES",
      description: `Sale created for order: ${createSaleDto.order}`,
    })

    return savedSale
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Sale>> {
    const { page = 1, limit = 10, sort = "date", order = "desc" } = params
    const skip = (page - 1) * limit

    const [sales, total] = await Promise.all([
      this.saleModel
        .find()
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("order", "orderNumber")
        .populate("customer", "firstName lastName email")
        .populate("products", "name price")
        .populate("transaction")
        .exec(),
      this.saleModel.countDocuments().exec(),
    ])

    return {
      data: sales,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findByCustomer(customerId: string, params: PaginationParams): Promise<PaginatedResult<Sale>> {
    const { page = 1, limit = 10, sort = "date", order = "desc" } = params
    const skip = (page - 1) * limit

    const [sales, total] = await Promise.all([
      this.saleModel
        .find({ customer: customerId })
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("order", "orderNumber")
        .populate("products", "name price")
        .populate("transaction")
        .exec(),
      this.saleModel.countDocuments({ customer: customerId }).exec(),
    ])

    return {
      data: sales,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleModel
      .findById(id)
      .populate("order", "orderNumber items total")
      .populate("customer", "firstName lastName email")
      .populate("products", "name price images")
      .populate("transaction")
      .exec()

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`)
    }

    return sale
  }

  async update(id: string, updateSaleDto: UpdateSaleDto, userId: string): Promise<Sale> {
    const sale = await this.findOne(id)

    // Create a new object for MongoDB update
    // This separates the DTO (with string date) from the MongoDB document (with Date object)
    const updateData: any = { ...updateSaleDto }

    // Convert string date to Date object if provided
    if (updateData.date) {
      updateData.date = new Date(updateData.date)
    }

    const updatedSale = await this.saleModel.findByIdAndUpdate(id, updateData, { new: true }).exec()

    // Log audit
    await this.auditService.createAuditLog({
      action: "UPDATE",
      userId,
      module: "SALES",
      description: `Sale updated for order: ${sale.order}`,
      changes: JSON.stringify(updateSaleDto),
    })

    return updatedSale
  }

  async remove(id: string, userId: string): Promise<Sale> {
    const sale = await this.findOne(id)

    const deletedSale = await this.saleModel.findByIdAndDelete(id).exec()

    // Log audit
    await this.auditService.createAuditLog({
      action: "DELETE",
      userId,
      module: "SALES",
      description: `Sale deleted for order: ${sale.order}`,
    })

    return deletedSale
  }

  async getSalesStatistics(): Promise<any> {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [totalSales, todaySales, weekSales, monthSales, totalAmount, todayAmount, weekAmount, monthAmount] =
      await Promise.all([
        this.saleModel.countDocuments().exec(),
        this.saleModel.countDocuments({ date: { $gte: startOfDay } }).exec(),
        this.saleModel.countDocuments({ date: { $gte: startOfWeek } }).exec(),
        this.saleModel.countDocuments({ date: { $gte: startOfMonth } }).exec(),
        this.saleModel.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]).exec(),
        this.saleModel
          .aggregate([
            { $match: { date: { $gte: startOfDay } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ])
          .exec(),
        this.saleModel
          .aggregate([
            { $match: { date: { $gte: startOfWeek } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ])
          .exec(),
        this.saleModel
          .aggregate([
            { $match: { date: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ])
          .exec(),
      ])

    return {
      sales: {
        total: totalSales,
        today: todaySales,
        week: weekSales,
        month: monthSales,
      },
      amount: {
        total: totalAmount.length > 0 ? totalAmount[0].total : 0,
        today: todayAmount.length > 0 ? todayAmount[0].total : 0,
        week: weekAmount.length > 0 ? weekAmount[0].total : 0,
        month: monthAmount.length > 0 ? monthAmount[0].total : 0,
      },
    }
  }

  async getTopSellingProducts(limit = 5): Promise<any> {
    return this.saleModel
      .aggregate([
        { $unwind: "$products" },
        { $group: { _id: "$products", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            _id: 0,
            product: {
              _id: "$product._id",
              name: "$product.name",
              price: "$product.price",
              images: "$product.images",
            },
            count: 1,
          },
        },
      ])
      .exec()
  }

  async getTopCustomers(limit = 5): Promise<any> {
    return this.saleModel
      .aggregate([
        { $group: { _id: "$customer", totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { totalAmount: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "customer",
          },
        },
        { $unwind: "$customer" },
        {
          $project: {
            _id: 0,
            customer: {
              _id: "$customer._id",
              firstName: "$customer.firstName",
              lastName: "$customer.lastName",
              email: "$customer.email",
            },
            totalAmount: 1,
            count: 1,
          },
        },
      ])
      .exec()
  }
}

