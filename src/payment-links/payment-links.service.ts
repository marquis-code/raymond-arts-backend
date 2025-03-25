import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { PaymentLink } from "./schemas/payment-link.schema"
import type { CreatePaymentLinkDto } from "./dto/create-payment-link.dto"
import type { UpdatePaymentLinkDto } from "./dto/update-payment-link.dto"
import type { UsePaymentLinkDto } from "./dto/use-payment-link.dto"
import { PaymentLinkStatus } from "./enums/payment-link-status.enum"
import type { PaginationParams, PaginatedResult } from "../common/interfaces/pagination.interface"
import type { TransactionsService } from "../transactions/transactions.service"
import { TransactionType } from "../transactions/enums/transaction-type.enum"
import { TransactionStatus } from "../transactions/enums/transaction-status.enum"
import type { AuditService } from "../audit/audit.service"
import type { NotificationsService } from "../notifications/notifications.service"

@Injectable()
export class PaymentLinksService {
  constructor(
    @InjectModel(PaymentLink.name) private paymentLinkModel: Model<PaymentLink>,
    private transactionsService: TransactionsService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createPaymentLinkDto: CreatePaymentLinkDto, userId: string): Promise<PaymentLink> {
    // Generate unique link ID
    const linkId = this.generateLinkId()

    const newPaymentLink = new this.paymentLinkModel({
      ...createPaymentLinkDto,
      linkId,
      createdBy: userId,
      status: PaymentLinkStatus.ACTIVE,
    })

    const savedPaymentLink = await newPaymentLink.save()

    // Log audit
    await this.auditService.createAuditLog({
      action: "CREATE",
      userId,
      module: "PAYMENT_LINKS",
      description: `Payment link created: ${savedPaymentLink.title}`,
    })

    return savedPaymentLink
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<PaymentLink>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc", search } = params
    const skip = (page - 1) * limit

    // Build query
    let query = {}
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { linkId: { $regex: search, $options: "i" } },
        ],
      }
    }

    // Execute query
    const [paymentLinks, total] = await Promise.all([
      this.paymentLinkModel
        .find(query)
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "firstName lastName email")
        .exec(),
      this.paymentLinkModel.countDocuments(query).exec(),
    ])

    return {
      data: paymentLinks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findByUser(userId: string, params: PaginationParams): Promise<PaginatedResult<PaymentLink>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
    const skip = (page - 1) * limit

    const [paymentLinks, total] = await Promise.all([
      this.paymentLinkModel
        .find({ createdBy: userId })
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.paymentLinkModel.countDocuments({ createdBy: userId }).exec(),
    ])

    return {
      data: paymentLinks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<PaymentLink> {
    const paymentLink = await this.paymentLinkModel
      .findById(id)
      .populate("createdBy", "firstName lastName email")
      .populate("transactions")
      .exec()

    if (!paymentLink) {
      throw new NotFoundException(`Payment link with ID ${id} not found`)
    }

    return paymentLink
  }

  async findByLinkId(linkId: string): Promise<PaymentLink> {
    const paymentLink = await this.paymentLinkModel
      .findOne({ linkId })
      .populate("createdBy", "firstName lastName email")
      .exec()

    if (!paymentLink) {
      throw new NotFoundException(`Payment link with ID ${linkId} not found`)
    }

    return paymentLink
  }

  async update(id: string, updatePaymentLinkDto: UpdatePaymentLinkDto, userId: string): Promise<PaymentLink> {
    const paymentLink = await this.findOne(id)

    // Check if user is the creator
    if (paymentLink.createdBy.toString() !== userId) {
      throw new BadRequestException("You can only update payment links you created")
    }

    const updatedPaymentLink = await this.paymentLinkModel
      .findByIdAndUpdate(id, updatePaymentLinkDto, { new: true })
      .exec()

    // Log audit
    await this.auditService.createAuditLog({
      action: "UPDATE",
      userId,
      module: "PAYMENT_LINKS",
      description: `Payment link updated: ${paymentLink.title}`,
      changes: JSON.stringify(updatePaymentLinkDto),
    })

    return updatedPaymentLink
  }

  async updateStatus(id: string, status: PaymentLinkStatus, userId: string): Promise<PaymentLink> {
    const paymentLink = await this.findOne(id)

    // Check if user is the creator
    if (paymentLink.createdBy.toString() !== userId) {
      throw new BadRequestException("You can only update payment links you created")
    }

    paymentLink.status = status
    const updatedPaymentLink = await paymentLink.save()

    // Log audit
    await this.auditService.createAuditLog({
      action: "UPDATE_STATUS",
      userId,
      module: "PAYMENT_LINKS",
      description: `Payment link status updated: ${paymentLink.title} to ${status}`,
    })

    return updatedPaymentLink
  }

  async remove(id: string, userId: string): Promise<PaymentLink> {
    const paymentLink = await this.findOne(id)

    // Check if user is the creator
    if (paymentLink.createdBy.toString() !== userId) {
      throw new BadRequestException("You can only delete payment links you created")
    }

    // Instead of deleting, mark as inactive
    paymentLink.status = PaymentLinkStatus.INACTIVE
    await paymentLink.save()

    // Log audit
    await this.auditService.createAuditLog({
      action: "DELETE",
      userId,
      module: "PAYMENT_LINKS",
      description: `Payment link deactivated: ${paymentLink.title}`,
    })

    return paymentLink
  }

  async usePaymentLink(usePaymentLinkDto: UsePaymentLinkDto, userId?: string): Promise<any> {
    const paymentLink = await this.findByLinkId(usePaymentLinkDto.linkId)

    // Check if payment link is usable
    if (paymentLink.status !== PaymentLinkStatus.ACTIVE) {
      throw new BadRequestException("Payment link is not active")
    }

    if (paymentLink.expiresAt && new Date() > new Date(paymentLink.expiresAt)) {
      // Update status to expired
      paymentLink.status = PaymentLinkStatus.EXPIRED
      await paymentLink.save()

      throw new BadRequestException("Payment link has expired")
    }

    if (paymentLink.usageLimit > 0 && paymentLink.usageCount >= paymentLink.usageLimit) {
      throw new BadRequestException("Payment link has reached its usage limit")
    }

    // Create transaction
    const transaction = await this.transactionsService.create({
      user: userId || paymentLink.createdBy.toString(),
      type: TransactionType.PAYMENT,
      amount: paymentLink.amount,
      status: TransactionStatus.PENDING,
      paymentMethod: usePaymentLinkDto.paymentMethod || "flutterwave",
      currency: paymentLink.currency,
      metadata: {
        ...paymentLink.metadata,
        ...usePaymentLinkDto.metadata,
        paymentLinkId: paymentLink.linkId,
        customerName: usePaymentLinkDto.customerName,
        customerEmail: usePaymentLinkDto.customerEmail,
      },
      description: `Payment for ${paymentLink.title}`,
    })

    // Increment usage count
    paymentLink.usageCount += 1

    // Add transaction to payment link
    if (!paymentLink.transactions) {
      paymentLink.transactions = []
    }

    paymentLink.transactions.push(transaction._id)
    await paymentLink.save()

    // If not reusable and limit reached, deactivate
    if (!paymentLink.isReusable && paymentLink.usageLimit > 0 && paymentLink.usageCount >= paymentLink.usageLimit) {
      paymentLink.status = PaymentLinkStatus.INACTIVE
      await paymentLink.save()
    }

    // Send notification to creator
    await this.notificationsService.createNotification({
      user: paymentLink.createdBy.toString(),
      title: "Payment Link Used",
      message: `Your payment link "${paymentLink.title}" has been used.`,
      type: "payment",
      reference: transaction._id.toString(),
    })

    // For Flutterwave integration
    if (usePaymentLinkDto.paymentMethod === "flutterwave") {
      // In a real implementation, you would integrate with Flutterwave API here
      // For now, we'll simulate a successful payment
      const flutterwaveResponse = await this.simulateFlutterwavePayment(paymentLink, transaction)

      // Update transaction with payment reference
      await this.transactionsService.update(transaction._id.toString(), {
        paymentReference: flutterwaveResponse.reference,
        gatewayResponse: "Approved",
        status: TransactionStatus.SUCCESSFUL,
      })

      // Log audit if userId provided
      if (userId) {
        await this.auditService.createAuditLog({
          action: "PAYMENT",
          userId,
          module: "PAYMENT_LINKS",
          description: `Payment made using link: ${paymentLink.title}`,
        })
      }

      return {
        success: true,
        message: "Payment successful",
        data: {
          transactionId: transaction.transactionId,
          reference: flutterwaveResponse.reference,
          amount: paymentLink.amount,
          currency: paymentLink.currency,
        },
      }
    }

    // For other payment methods, return transaction details
    return {
      success: true,
      message: "Payment initiated",
      data: {
        transactionId: transaction.transactionId,
        amount: paymentLink.amount,
        currency: paymentLink.currency,
      },
    }
  }

  private generateLinkId(): string {
    const prefix = "PAY"
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    return `${prefix}-${timestamp}-${random}`
  }

  private async simulateFlutterwavePayment(paymentLink: any, transaction: any) {
    // In a real implementation, you would call Flutterwave API here
    // For now, we'll simulate a successful payment
    return {
      status: "success",
      message: "Payment successful",
      data: {
        id: Math.floor(Math.random() * 1000000000),
        tx_ref: transaction.transactionId,
        flw_ref: `FLW-${Math.floor(Math.random() * 1000000000)}`,
        device_fingerprint: "N/A",
        amount: paymentLink.amount,
        currency: paymentLink.currency,
        charged_amount: paymentLink.amount,
        app_fee: paymentLink.amount * 0.015,
        merchant_fee: 0,
        processor_response: "Approved",
        auth_model: "PIN",
        ip: "N/A",
        narration: `Payment for ${paymentLink.title}`,
        status: "successful",
        payment_type: "card",
        created_at: new Date().toISOString(),
        account_id: 1234,
      },
      reference: `FLW-REF-${Math.floor(Math.random() * 1000000000)}`,
    }
  }
}

