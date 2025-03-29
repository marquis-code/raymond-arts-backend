import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { Invoice } from "./schemas/invoice.schema"
import type { CreateInvoiceDto } from "./dto/create-invoice.dto"
import type { UpdateInvoiceDto } from "./dto/update-invoice.dto"
import { InvoiceStatus } from "./enums/invoice-status.enum"
import type { PaginationParams, PaginatedResult } from "../common/interfaces/pagination.interface"
import { UsersService } from "../users/users.service"
import { EmailService } from "../email/email.service"
import { AuditService } from "../audit/audit.service"
import { NotificationsService } from "../notifications/notifications.service"
import { Types } from "mongoose"

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
    private usersService: UsersService,
    private emailService: EmailService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    // Validate customer
    const customer = await this.usersService.findById(createInvoiceDto.customer)

    // Generate invoice number
    const invoiceNumber = this.generateInvoiceNumber()

    // Calculate totals
    let subtotal = 0
    const items = createInvoiceDto.items.map((item) => {
      const total = item.price * item.quantity
      subtotal += total
      return {
        ...item,
        total,
      }
    })

    // Calculate tax and total
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

    // Create invoice
    const newInvoice = new this.invoiceModel({
      invoiceNumber,
      customer: createInvoiceDto.customer,
      order: createInvoiceDto.order,
      items,
      subtotal,
      tax,
      total,
      status: InvoiceStatus.PENDING,
      dueDate: new Date(createInvoiceDto.dueDate),
      notes: createInvoiceDto.notes,
      billingAddress: createInvoiceDto.billingAddress,
    })

    const savedInvoice = await newInvoice.save()

    // Send email notification
    await this.emailService.sendInvoice(savedInvoice, customer)

    // Send notification
    await this.notificationsService.createNotification({
      user: customer._id.toString(),
      title: "New Invoice",
      message: `Invoice #${invoiceNumber} has been created for you.`,
      type: "invoice",
      reference: savedInvoice._id.toString(),
    })

    // Log audit
    await this.auditService.createAuditLog({
      action: "CREATE",
      userId,
      module: "INVOICES",
      description: `Invoice created: #${invoiceNumber}`,
    })

    return savedInvoice
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Invoice>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc", search } = params
    const skip = (page - 1) * limit

    // Build query
    let query = {}
    if (search) {
      query = {
        $or: [
          { invoiceNumber: { $regex: search, $options: "i" } },
          { "billingAddress.firstName": { $regex: search, $options: "i" } },
          { "billingAddress.lastName": { $regex: search, $options: "i" } },
          { "billingAddress.email": { $regex: search, $options: "i" } },
        ],
      }
    }

    // Execute query
    const [invoices, total] = await Promise.all([
      this.invoiceModel
        .find(query)
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("customer", "firstName lastName email")
        .populate("order", "orderNumber")
        .populate("transaction")
        .exec(),
      this.invoiceModel.countDocuments(query).exec(),
    ])

    return {
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findByUser(userId: string, params: PaginationParams): Promise<PaginatedResult<Invoice>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
    const skip = (page - 1) * limit

    const [invoices, total] = await Promise.all([
      this.invoiceModel
        .find({ customer: userId })
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("order", "orderNumber")
        .populate("transaction")
        .exec(),
      this.invoiceModel.countDocuments({ customer: userId }).exec(),
    ])

    return {
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceModel
      .findById(id)
      .populate("customer", "firstName lastName email phone")
      .populate("order", "orderNumber items total")
      .populate("transaction")
      .exec()

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`)
    }

    return invoice
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice> {
    const invoice = await this.invoiceModel
      .findOne({ invoiceNumber })
      .populate("customer", "firstName lastName email phone")
      .populate("order", "orderNumber items total")
      .populate("transaction")
      .exec()

    if (!invoice) {
      throw new NotFoundException(`Invoice #${invoiceNumber} not found`)
    }

    return invoice
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, userId: string): Promise<Invoice> {
    const invoice = await this.findOne(id)

    // If status is already PAID, don't allow updates
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException("Cannot update a paid invoice")
    }

    // Calculate totals if items are updated
    if (updateInvoiceDto.items) {
      let subtotal = 0
      const items = updateInvoiceDto.items.map((item) => {
        const total = item.price * item.quantity
        subtotal += total
        return {
          ...item,
          total,
        }
      })

      // Calculate tax and total
      const tax = subtotal * 0.1 // 10% tax
      const total = subtotal + tax

      // Update invoice with new totals
      updateInvoiceDto["subtotal"] = subtotal
      updateInvoiceDto["tax"] = tax
      updateInvoiceDto["total"] = total
      updateInvoiceDto["items"] = items
    }

    const updatedInvoice = await this.invoiceModel.findByIdAndUpdate(id, updateInvoiceDto, { new: true }).exec()

    // Log audit
    await this.auditService.createAuditLog({
      action: "UPDATE",
      userId,
      module: "INVOICES",
      description: `Invoice updated: #${invoice.invoiceNumber}`,
      changes: JSON.stringify(updateInvoiceDto),
    })

    return updatedInvoice
  }

  async updateStatus(id: string, status: InvoiceStatus, transactionId?: string, userId?: string): Promise<Invoice> {
    const invoice = await this.findOne(id)

    // Update invoice status
    invoice.status = status

    // Update transaction reference if provided
    // if (transactionId) {
    //   invoice.transaction = transactionId
    // }
    if (transactionId) {
      invoice.transaction = new Types.ObjectId(transactionId) // Convert string to ObjectId
    }

    // Update paid date if status is PAID
    if (status === InvoiceStatus.PAID && !invoice.paidDate) {
      invoice.paidDate = new Date()
    }

    const updatedInvoice = await invoice.save()

    // Send notification to customer
    if (status === InvoiceStatus.PAID) {
      await this.notificationsService.createNotification({
        user: invoice.customer.toString(),
        title: "Invoice Paid",
        message: `Your invoice #${invoice.invoiceNumber} has been marked as paid.`,
        type: "invoice",
        reference: invoice._id.toString(),
      })
    } else if (status === InvoiceStatus.OVERDUE) {
      await this.notificationsService.createNotification({
        user: invoice.customer.toString(),
        title: "Invoice Overdue",
        message: `Your invoice #${invoice.invoiceNumber} is now overdue.`,
        type: "invoice",
        reference: invoice._id.toString(),
      })
    }

    // Log audit if userId provided
    if (userId) {
      await this.auditService.createAuditLog({
        action: "UPDATE_STATUS",
        userId,
        module: "INVOICES",
        description: `Invoice status updated: #${invoice.invoiceNumber} to ${status}`,
      })
    }

    return updatedInvoice
  }

  async remove(id: string, userId: string): Promise<Invoice> {
    const invoice = await this.findOne(id)

    // If status is PAID, don't allow deletion
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException("Cannot delete a paid invoice")
    }

    // Instead of deleting, mark as cancelled
    invoice.status = InvoiceStatus.CANCELLED
    await invoice.save()

    // Log audit
    await this.auditService.createAuditLog({
      action: "DELETE",
      userId,
      module: "INVOICES",
      description: `Invoice cancelled: #${invoice.invoiceNumber}`,
    })

    return invoice
  }

  async checkOverdueInvoices(): Promise<void> {
    const today = new Date()

    // Find all pending invoices with due date before today
    const overdueInvoices = await this.invoiceModel
      .find({
        status: InvoiceStatus.PENDING,
        dueDate: { $lt: today },
      })
      .populate("customer", "firstName lastName email")
      .exec()

    // Update status to OVERDUE
    for (const invoice of overdueInvoices) {
      await this.updateStatus(invoice._id.toString(), InvoiceStatus.OVERDUE)

      // Send email notification
      await this.emailService.sendEmail(invoice.customer["email"], "Invoice Overdue", "invoice-overdue", {
        customer: invoice.customer,
        invoice,
        daysOverdue: Math.ceil((today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
      })
    }
  }

  private generateInvoiceNumber(): string {
    const prefix = "INV"
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${prefix}-${timestamp}-${random}`
  }
}

