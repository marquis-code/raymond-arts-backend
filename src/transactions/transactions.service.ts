import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { Transaction } from "./schemas/transaction.schema"
import type { CreateTransactionDto } from "./dto/create-transaction.dto"
import type { UpdateTransactionDto } from "./dto/update-transaction.dto"
import { TransactionStatus } from "./enums/transaction-status.enum"
import type { PaginationParams, PaginatedResult } from "../common/interfaces/pagination.interface"

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transactionId = this.generateTransactionId()

    const newTransaction = new this.transactionModel({
      ...createTransactionDto,
      transactionId,
    })

    return newTransaction.save()
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Transaction>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc", search } = params
    const skip = (page - 1) * limit

    // Build query
    let query = {}
    if (search) {
      query = {
        $or: [
          { transactionId: { $regex: search, $options: "i" } },
          { paymentReference: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      }
    }

    // Execute query
    const [transactions, total] = await Promise.all([
      this.transactionModel
        .find(query)
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "firstName lastName email")
        .populate("order", "orderNumber")
        .populate("invoice", "invoiceNumber")
        .exec(),
      this.transactionModel.countDocuments(query).exec(),
    ])

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findByUser(userId: string, params: PaginationParams): Promise<PaginatedResult<Transaction>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
    const skip = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      this.transactionModel
        .find({ user: userId })
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("order", "orderNumber")
        .populate("invoice", "invoiceNumber")
        .exec(),
      this.transactionModel.countDocuments({ user: userId }).exec(),
    ])

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionModel
      .findById(id)
      .populate("user", "firstName lastName email")
      .populate("order", "orderNumber items total")
      .populate("invoice", "invoiceNumber amount")
      .exec()

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`)
    }

    return transaction
  }

  async findByTransactionId(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionModel
      .findOne({ transactionId })
      .populate("user", "firstName lastName email")
      .populate("order", "orderNumber items total")
      .populate("invoice", "invoiceNumber amount")
      .exec()

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found`)
    }

    return transaction
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.transactionModel.findByIdAndUpdate(id, updateTransactionDto, { new: true }).exec()

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`)
    }

    return transaction
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<Transaction> {
    const transaction = await this.findOne(id)

    transaction.status = status

    // Update timestamps based on status
    if (status === TransactionStatus.SUCCESSFUL && !transaction.completedAt) {
      transaction.completedAt = new Date()
    } else if (
      (status === TransactionStatus.FAILED || status === TransactionStatus.CANCELLED) &&
      !transaction.failedAt
    ) {
      transaction.failedAt = new Date()
    }

    return transaction.save()
  }

  async remove(id: string): Promise<Transaction> {
    const transaction = await this.transactionModel.findByIdAndDelete(id).exec()

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`)
    }

    return transaction
  }

  async getTransactionStatistics(): Promise<any> {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
      todayTransactions,
      weekTransactions,
      monthTransactions,
      totalAmount,
      todayAmount,
      weekAmount,
      monthAmount,
    ] = await Promise.all([
      this.transactionModel.countDocuments().exec(),
      this.transactionModel.countDocuments({ status: TransactionStatus.SUCCESSFUL }).exec(),
      this.transactionModel.countDocuments({ status: TransactionStatus.FAILED }).exec(),
      this.transactionModel.countDocuments({ status: TransactionStatus.PENDING }).exec(),
      this.transactionModel.countDocuments({ createdAt: { $gte: startOfDay } }).exec(),
      this.transactionModel.countDocuments({ createdAt: { $gte: startOfWeek } }).exec(),
      this.transactionModel.countDocuments({ createdAt: { $gte: startOfMonth } }).exec(),
      this.transactionModel
        .aggregate([
          { $match: { status: TransactionStatus.SUCCESSFUL } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .exec(),
      this.transactionModel
        .aggregate([
          { $match: { status: TransactionStatus.SUCCESSFUL, createdAt: { $gte: startOfDay } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .exec(),
      this.transactionModel
        .aggregate([
          { $match: { status: TransactionStatus.SUCCESSFUL, createdAt: { $gte: startOfWeek } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .exec(),
      this.transactionModel
        .aggregate([
          { $match: { status: TransactionStatus.SUCCESSFUL, createdAt: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .exec(),
    ])

    return {
      transactions: {
        total: totalTransactions,
        successful: successfulTransactions,
        failed: failedTransactions,
        pending: pendingTransactions,
        today: todayTransactions,
        week: weekTransactions,
        month: monthTransactions,
      },
      amount: {
        total: totalAmount.length > 0 ? totalAmount[0].total : 0,
        today: todayAmount.length > 0 ? todayAmount[0].total : 0,
        week: weekAmount.length > 0 ? weekAmount[0].total : 0,
        month: monthAmount.length > 0 ? monthAmount[0].total : 0,
      },
    }
  }

  private generateTransactionId(): string {
    const prefix = "TRX"
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${prefix}-${timestamp}-${random}`
  }
}

