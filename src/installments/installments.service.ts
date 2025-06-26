import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { Types } from "mongoose"
import { Model } from "mongoose"
import { Cron, CronExpression } from "@nestjs/schedule"
import { InstallmentPlan, InstallmentStatus, InstallmentPaymentStatus } from "./schemas/installment-plan.schema"
import { Product } from "../products/schemas/product.schema"
import { Order } from "../orders/schemas/order.schema"
import { UsersService } from "../users/users.service"
import { EmailService } from "./email.service"
import { NotificationsService } from "../notifications/notifications.service"
import { TransactionsService } from "../transactions/transactions.service"
import { UpdateInstallmentPlanDto } from "./dto/update-installment-plan.dto"
import { AuditService } from "../audit/audit.service"
import { CreateInstallmentPlanDto } from "./dto/create-installment-plan.dto"
import { ProcessInstallmentPaymentDto } from "./dto/process-installment-payment.dto"

@Injectable()
export class InstallmentsService {
  private installmentPlanModel: Model<InstallmentPlan>
  private orderModel: Model<Order>
  private productModel: Model<Product>
  private usersService: UsersService
  private emailService: EmailService
  private auditService: AuditService
  private notificationsService: NotificationsService
  private transactionsService: TransactionsService

  constructor(
    installmentPlanModel: Model<InstallmentPlan>,
    orderModel: Model<Order>,
    productModel: Model<Product>,
    usersService: UsersService,
    emailService: EmailService,
    auditService: AuditService,
    notificationsService: NotificationsService,
    transactionsService: TransactionsService,
  ) {
    this.installmentPlanModel = installmentPlanModel
    this.orderModel = orderModel
    this.productModel = productModel
    this.usersService = usersService
    this.emailService = emailService
    this.auditService = auditService
    this.notificationsService = notificationsService
    this.transactionsService = transactionsService
  }

  async createInstallmentPlan(createDto: CreateInstallmentPlanDto, userId: string): Promise<InstallmentPlan> {
    try {
      // Get order details
      const order = await this.orderModel.findById(createDto.orderId).populate("items.product").exec()

      if (!order) {
        throw new NotFoundException("Order not found")
      }

      // Verify order belongs to user
      if (order.customer.toString() !== userId) {
        throw new BadRequestException("Order does not belong to this user")
      }

      // Check if order already has an installment plan
      if (order.installmentInfo?.isInstallment) {
        throw new BadRequestException("Order already has an installment plan")
      }

      // Validate installment eligibility for all products in order
      for (const item of order.items) {
        const product = item.product as any
        if (!product.installmentConfig?.enabled) {
          throw new BadRequestException(`Product ${product.name} does not support installment payments`)
        }

        if (order.total < product.installmentConfig.minimumAmount) {
          throw new BadRequestException(
            `Order total must be at least ${product.installmentConfig.minimumAmount} for installment payments`,
          )
        }

        if (!product.installmentConfig.availableTerms.includes(createDto.numberOfInstallments)) {
          throw new BadRequestException(
            `${createDto.numberOfInstallments} installments not available for product ${product.name}`,
          )
        }
      }

      // Calculate installment details
      const totalAmount = order.total
      const downPayment = createDto.downPayment || totalAmount * 0.2 // Default 20% down payment
      const remainingAmount = totalAmount - downPayment

      // Get interest rate from first product (assuming all products have same rate for simplicity)
      const firstProduct = order.items[0].product as any
      const annualInterestRate = firstProduct.installmentConfig.interestRate || 0
      const monthlyInterestRate = annualInterestRate / 12 / 100

      // Calculate installment amount with interest
      let installmentAmount: number
      let totalInterest: number

      if (monthlyInterestRate > 0) {
        // Calculate using compound interest formula
        const factor = Math.pow(1 + monthlyInterestRate, createDto.numberOfInstallments)
        installmentAmount = (remainingAmount * monthlyInterestRate * factor) / (factor - 1)
        totalInterest = installmentAmount * createDto.numberOfInstallments - remainingAmount
      } else {
        // No interest
        installmentAmount = remainingAmount / createDto.numberOfInstallments
        totalInterest = 0
      }

      const totalPayable = downPayment + installmentAmount * createDto.numberOfInstallments

      // Generate plan number
      const planNumber = this.generatePlanNumber()

      // Create installment payments schedule
      const startDate = createDto.startDate || new Date()
      const payments = []

      for (let i = 1; i <= createDto.numberOfInstallments; i++) {
        const dueDate = new Date(startDate)
        dueDate.setMonth(dueDate.getMonth() + i)

        payments.push({
          installmentNumber: i,
          amount: installmentAmount,
          dueDate,
          status: InstallmentPaymentStatus.PENDING,
          lateFee: 0,
          reminderCount: 0,
        })
      }

      // Calculate end date
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + createDto.numberOfInstallments)

      // Create installment plan
      const installmentPlan = new this.installmentPlanModel({
        planNumber,
        customer: new Types.ObjectId(userId),
        order: new Types.ObjectId(createDto.orderId),
        totalAmount,
        downPayment,
        installmentAmount,
        numberOfInstallments: createDto.numberOfInstallments,
        interestRate: annualInterestRate,
        totalInterest,
        totalPayable,
        status: InstallmentStatus.ACTIVE,
        startDate,
        endDate,
        payments,
        paidAmount: downPayment, // Down payment is considered paid
        remainingAmount: installmentAmount * createDto.numberOfInstallments,
        overdueAmount: 0,
      })

      const savedPlan = await installmentPlan.save()

      // Update order with installment information
      await this.orderModel.findByIdAndUpdate(createDto.orderId, {
        paymentType: "installment",
        installmentInfo: {
          isInstallment: true,
          installmentPlan: savedPlan._id,
          numberOfInstallments: createDto.numberOfInstallments,
          downPayment,
          installmentAmount,
          interestRate: annualInterestRate,
          totalPayable,
        },
      })

      // Send confirmation email
      try {
        const user = await this.usersService.findById(userId)
        await this.emailService.sendInstallmentPlanCreated(savedPlan, user, order)
      } catch (emailError) {
        console.error("Failed to send installment plan creation email:", emailError)
        // Don't throw error, just log it
      }

      // Send notification
      try {
        await this.notificationsService.createNotification({
          user: userId,
          title: "Installment Plan Created",
          message: `Your installment plan #${planNumber} has been created successfully.`,
          type: "installment",
          reference: savedPlan._id.toString(),
        })
      } catch (notificationError) {
        console.error("Failed to send installment plan notification:", notificationError)
      }

      // Log audit
      try {
        await this.auditService.createAuditLog({
          action: "CREATE",
          userId,
          module: "INSTALLMENTS",
          description: `Installment plan created: #${planNumber}`,
        })
      } catch (auditError) {
        console.error("Failed to log installment plan audit:", auditError)
      }

      return savedPlan
    } catch (error) {
      console.error("Error creating installment plan:", error)
      throw error
    }
  }

  async processInstallmentPayment(processDto: ProcessInstallmentPaymentDto, userId: string): Promise<InstallmentPlan> {
    try {
      const plan = await this.installmentPlanModel.findById(processDto.planId).exec()

      if (!plan) {
        throw new NotFoundException("Installment plan not found")
      }

      // Verify plan belongs to user
      if (plan.customer.toString() !== userId) {
        throw new BadRequestException("Installment plan does not belong to this user")
      }

      // Find the specific installment payment
      const payment = plan.payments.find((p) => p.installmentNumber === processDto.installmentNumber)

      if (!payment) {
        throw new NotFoundException("Installment payment not found")
      }

      if (payment.status === InstallmentPaymentStatus.PAID) {
        throw new BadRequestException("Installment payment already paid")
      }

      // Update payment status
      payment.status = InstallmentPaymentStatus.PAID
      payment.paidDate = new Date()
      payment.transaction = new Types.ObjectId(processDto.transactionId)

      // Update plan totals
      plan.paidAmount += payment.amount
      plan.remainingAmount -= payment.amount

      // Check if plan is completed
      const allPaid = plan.payments.every((p) => p.status === InstallmentPaymentStatus.PAID)
      if (allPaid) {
        plan.status = InstallmentStatus.COMPLETED
        plan.completedAt = new Date()
      }

      const updatedPlan = await plan.save()

      // Send confirmation email
      try {
        const user = await this.usersService.findById(userId)
        await this.emailService.sendInstallmentPaymentConfirmation(updatedPlan, payment, user)
      } catch (emailError) {
        console.error("Failed to send installment payment confirmation email:", emailError)
      }

      // Send notification
      try {
        await this.notificationsService.createNotification({
          user: userId,
          title: "Installment Payment Processed",
          message: `Your installment payment #${processDto.installmentNumber} has been processed successfully.`,
          type: "installment",
          reference: updatedPlan._id.toString(),
        })
      } catch (notificationError) {
        console.error("Failed to send installment payment notification:", notificationError)
      }

      // Log audit
      try {
        await this.auditService.createAuditLog({
          action: "PAYMENT",
          userId,
          module: "INSTALLMENTS",
          description: `Installment payment processed: Plan #${plan.planNumber}, Payment #${processDto.installmentNumber}`,
        })
      } catch (auditError) {
        console.error("Failed to log installment payment audit:", auditError)
      }

      return updatedPlan
    } catch (error) {
      console.error("Error processing installment payment:", error)
      throw error
    }
  }

  async getInstallmentPlan(planId: string, userId: string): Promise<InstallmentPlan> {
    try {
      const plan = await this.installmentPlanModel
        .findById(planId)
        .populate("customer", "firstName lastName email")
        .populate("order", "orderNumber total items")
        .exec()

      if (!plan) {
        throw new NotFoundException("Installment plan not found")
      }

      // Verify plan belongs to user (unless admin)
      if (plan.customer.toString() !== userId) {
        throw new BadRequestException("Installment plan does not belong to this user")
      }

      return plan
    } catch (error) {
      console.error("Error fetching installment plan:", error)
      throw error
    }
  }

  // Cron job to check for overdue payments and send reminders
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkOverduePayments(): Promise<void> {
    try {
      console.log("Checking for overdue installment payments...")

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Find all active installment plans
      const activePlans = await this.installmentPlanModel
        .find({ status: InstallmentStatus.ACTIVE })
        .populate("customer", "firstName lastName email")
        .exec()

      for (const plan of activePlans) {
        let hasOverdue = false
        let overdueAmount = 0

        for (const payment of plan.payments) {
          if (payment.status === InstallmentPaymentStatus.PENDING && payment.dueDate < today) {
            // Mark as overdue
            payment.status = InstallmentPaymentStatus.OVERDUE
            hasOverdue = true
            overdueAmount += payment.amount

            // Send reminder email if not sent recently
            const daysSinceLastReminder = payment.reminderSentAt
              ? Math.floor((today.getTime() - payment.reminderSentAt.getTime()) / (1000 * 60 * 60 * 24))
              : 999

            if (daysSinceLastReminder >= 7) {
              // Send reminder weekly
              await this.sendPaymentReminder(plan, payment)
              payment.reminderSentAt = new Date()
              payment.reminderCount += 1
            }
          }
        }

        if (hasOverdue) {
          plan.overdueAmount = overdueAmount
          await plan.save()

          // Check if plan should be marked as defaulted (e.g., 3 months overdue)
          const oldestOverduePayment = plan.payments
            .filter((p) => p.status === InstallmentPaymentStatus.OVERDUE)
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0]

          if (oldestOverduePayment) {
            const daysOverdue = Math.floor(
              (today.getTime() - oldestOverduePayment.dueDate.getTime()) / (1000 * 60 * 60 * 24),
            )

            if (daysOverdue >= 90) {
              // 3 months
              plan.status = InstallmentStatus.DEFAULTED
              plan.defaultedAt = new Date()
              await plan.save()

              // Send default notification
              await this.sendDefaultNotification(plan)
            }
          }
        }
      }

      console.log("Overdue payment check completed")
    } catch (error) {
      console.error("Error checking overdue payments:", error)
    }
  }

  // Cron job to send upcoming payment reminders
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendUpcomingPaymentReminders(): Promise<void> {
    try {
      console.log("Sending upcoming payment reminders...")

      const reminderDate = new Date()
      reminderDate.setDate(reminderDate.getDate() + 3) // 3 days before due date
      reminderDate.setHours(23, 59, 59, 999)

      const activePlans = await this.installmentPlanModel
        .find({ status: InstallmentStatus.ACTIVE })
        .populate("customer", "firstName lastName email")
        .exec()

      for (const plan of activePlans) {
        for (const payment of plan.payments) {
          if (
            payment.status === InstallmentPaymentStatus.PENDING &&
            payment.dueDate <= reminderDate &&
            payment.dueDate > new Date()
          ) {
            // Check if reminder already sent for this payment
            const daysSinceLastReminder = payment.reminderSentAt
              ? Math.floor((new Date().getTime() - payment.reminderSentAt.getTime()) / (1000 * 60 * 60 * 24))
              : 999

            if (daysSinceLastReminder >= 3) {
              // Don't spam reminders
              await this.sendUpcomingPaymentReminder(plan, payment)
              payment.reminderSentAt = new Date()
              payment.reminderCount += 1
              await plan.save()
            }
          }
        }
      }

      console.log("Upcoming payment reminders sent")
    } catch (error) {
      console.error("Error sending upcoming payment reminders:", error)
    }
  }

  private async sendPaymentReminder(plan: InstallmentPlan, payment: any): Promise<void> {
    try {
      const customer = plan.customer as any
      const daysOverdue = Math.floor((new Date().getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24))

      await this.emailService.sendInstallmentPaymentReminder(plan, payment, customer, daysOverdue)

      await this.notificationsService.createNotification({
        user: customer._id.toString(),
        title: "Overdue Payment Reminder",
        message: `Your installment payment #${payment.installmentNumber} is ${daysOverdue} days overdue.`,
        type: "installment",
        reference: plan._id.toString(),
      })
    } catch (error) {
      console.error("Error sending payment reminder:", error)
    }
  }

  private async sendUpcomingPaymentReminder(plan: InstallmentPlan, payment: any): Promise<void> {
    try {
      const customer = plan.customer as any
      const daysUntilDue = Math.ceil((payment.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

      await this.emailService.sendUpcomingInstallmentReminder(plan, payment, customer, daysUntilDue)

      await this.notificationsService.createNotification({
        user: customer._id.toString(),
        title: "Upcoming Payment Reminder",
        message: `Your installment payment #${payment.installmentNumber} is due in ${daysUntilDue} days.`,
        type: "installment",
        reference: plan._id.toString(),
      })
    } catch (error) {
      console.error("Error sending upcoming payment reminder:", error)
    }
  }

  async getUserInstallmentPlans(
    userId: string,
    options: { status?: InstallmentStatus; page: number; limit: number },
  ): Promise<{ data: any[]; meta: any }> {
    try {
      const { status, page, limit } = options
      const skip = (page - 1) * limit

      const query: any = { customer: new Types.ObjectId(userId) }
      if (status) {
        query.status = status
      }

      const [plans, total] = await Promise.all([
        this.installmentPlanModel
          .find(query)
          .populate("order", "orderNumber total")
          .populate("customer", "firstName lastName email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.installmentPlanModel.countDocuments(query).exec(),
      ])

      return {
        data: plans,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      console.error("Error fetching user installment plans:", error)
      throw error
    }
  }

  async getAllInstallmentPlans(options: {
    status?: InstallmentStatus
    customerId?: string
    page: number
    limit: number
    search?: string
  }): Promise<{ data: any[]; meta: any }> {
    try {
      const { status, customerId, page, limit, search } = options
      const skip = (page - 1) * limit

      const query: any = {}

      if (status) {
        query.status = status
      }

      if (customerId) {
        query.customer = new Types.ObjectId(customerId)
      }

      if (search) {
        query.$or = [{ planNumber: { $regex: search, $options: "i" } }]
      }

      const [plans, total] = await Promise.all([
        this.installmentPlanModel
          .find(query)
          .populate("order", "orderNumber total")
          .populate("customer", "firstName lastName email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.installmentPlanModel.countDocuments(query).exec(),
      ])

      return {
        data: plans,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      console.error("Error fetching all installment plans:", error)
      throw error
    }
  }

  async getUpcomingPayments(userId: string, days = 30): Promise<any[]> {
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)

      const plans = await this.installmentPlanModel
        .find({
          customer: new Types.ObjectId(userId),
          status: InstallmentStatus.ACTIVE,
        })
        .populate("order", "orderNumber")
        .exec()

      const upcomingPayments = []

      for (const plan of plans) {
        for (const payment of plan.payments) {
          if (
            payment.status === InstallmentPaymentStatus.PENDING &&
            payment.dueDate <= futureDate &&
            payment.dueDate > new Date()
          ) {
            upcomingPayments.push({
              planId: plan._id,
              planNumber: plan.planNumber,
              orderNumber: (plan.order as any)?.orderNumber,
              installmentNumber: payment.installmentNumber,
              amount: payment.amount,
              dueDate: payment.dueDate,
              daysUntilDue: Math.ceil((payment.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
            })
          }
        }
      }

      return upcomingPayments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    } catch (error) {
      console.error("Error fetching upcoming payments:", error)
      throw error
    }
  }

  async getOverduePayments(userId: string): Promise<any[]> {
    try {
      const today = new Date()

      const plans = await this.installmentPlanModel
        .find({
          customer: new Types.ObjectId(userId),
          status: InstallmentStatus.ACTIVE,
        })
        .populate("order", "orderNumber")
        .exec()

      const overduePayments = []

      for (const plan of plans) {
        for (const payment of plan.payments) {
          if (
            payment.status === InstallmentPaymentStatus.OVERDUE ||
            (payment.status === InstallmentPaymentStatus.PENDING && payment.dueDate < today)
          ) {
            overduePayments.push({
              planId: plan._id,
              planNumber: plan.planNumber,
              orderNumber: (plan.order as any)?.orderNumber,
              installmentNumber: payment.installmentNumber,
              amount: payment.amount,
              dueDate: payment.dueDate,
              daysOverdue: Math.ceil((today.getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
              lateFee: payment.lateFee,
            })
          }
        }
      }

      return overduePayments.sort((a, b) => b.daysOverdue - a.daysOverdue)
    } catch (error) {
      console.error("Error fetching overdue payments:", error)
      throw error
    }
  }

  async getInstallmentAnalytics(options: { startDate?: Date; endDate?: Date }): Promise<any> {
    try {
      const { startDate, endDate } = options
      const matchStage: any = {}

      if (startDate || endDate) {
        matchStage.createdAt = {}
        if (startDate) matchStage.createdAt.$gte = startDate
        if (endDate) matchStage.createdAt.$lte = endDate
      }

      const [
        totalPlans,
        activePlans,
        completedPlans,
        defaultedPlans,
        totalAmount,
        collectedAmount,
        overdueAmount,
        monthlyTrends,
      ] = await Promise.all([
        this.installmentPlanModel.countDocuments(matchStage).exec(),
        this.installmentPlanModel.countDocuments({ ...matchStage, status: InstallmentStatus.ACTIVE }).exec(),
        this.installmentPlanModel.countDocuments({ ...matchStage, status: InstallmentStatus.COMPLETED }).exec(),
        this.installmentPlanModel.countDocuments({ ...matchStage, status: InstallmentStatus.DEFAULTED }).exec(),
        this.installmentPlanModel
          .aggregate([{ $match: matchStage }, { $group: { _id: null, total: { $sum: "$totalPayable" } } }])
          .exec(),
        this.installmentPlanModel
          .aggregate([{ $match: matchStage }, { $group: { _id: null, total: { $sum: "$paidAmount" } } }])
          .exec(),
        this.installmentPlanModel
          .aggregate([{ $match: matchStage }, { $group: { _id: null, total: { $sum: "$overdueAmount" } } }])
          .exec(),
        this.installmentPlanModel
          .aggregate([
            { $match: matchStage },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                count: { $sum: 1 },
                totalAmount: { $sum: "$totalPayable" },
                collectedAmount: { $sum: "$paidAmount" },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ])
          .exec(),
      ])

      return {
        summary: {
          totalPlans,
          activePlans,
          completedPlans,
          defaultedPlans,
          totalAmount: totalAmount[0]?.total || 0,
          collectedAmount: collectedAmount[0]?.total || 0,
          overdueAmount: overdueAmount[0]?.total || 0,
          collectionRate: totalAmount[0]?.total ? ((collectedAmount[0]?.total || 0) / totalAmount[0].total) * 100 : 0,
        },
        monthlyTrends,
      }
    } catch (error) {
      console.error("Error fetching installment analytics:", error)
      throw error
    }
  }

  async getDefaultedPlans(options: { page: number; limit: number }): Promise<{ data: any[]; meta: any }> {
    try {
      const { page, limit } = options
      const skip = (page - 1) * limit

      const [plans, total] = await Promise.all([
        this.installmentPlanModel
          .find({ status: InstallmentStatus.DEFAULTED })
          .populate("customer", "firstName lastName email phone")
          .populate("order", "orderNumber total")
          .sort({ defaultedAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.installmentPlanModel.countDocuments({ status: InstallmentStatus.DEFAULTED }).exec(),
      ])

      return {
        data: plans,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      console.error("Error fetching defaulted plans:", error)
      throw error
    }
  }

  async updateInstallmentPlan(id: string, updateData: UpdateInstallmentPlanDto, userId: string): Promise<any> {
    try {
      const plan = await this.installmentPlanModel.findById(id).exec()

      if (!plan) {
        throw new NotFoundException("Installment plan not found")
      }

      // Update the plan
      Object.assign(plan, updateData)
      const updatedPlan = await plan.save()

      // Log audit
      await this.auditService.createAuditLog({
        action: "UPDATE",
        userId,
        module: "INSTALLMENTS",
        description: `Installment plan updated: #${plan.planNumber}`,
        changes: JSON.stringify(updateData),
      })

      return updatedPlan
    } catch (error) {
      console.error("Error updating installment plan:", error)
      throw error
    }
  }

  async cancelInstallmentPlan(id: string, reason: string, userId: string): Promise<any> {
    try {
      const plan = await this.installmentPlanModel.findById(id).exec()

      if (!plan) {
        throw new NotFoundException("Installment plan not found")
      }

      plan.status = InstallmentStatus.CANCELLED
      plan.cancelledAt = new Date()
      plan.notes = `${plan.notes || ""}\nCancelled: ${reason}`

      const cancelledPlan = await plan.save()

      // Log audit
      await this.auditService.createAuditLog({
        action: "CANCEL",
        userId,
        module: "INSTALLMENTS",
        description: `Installment plan cancelled: #${plan.planNumber}`,
        changes: JSON.stringify({ reason }),
      })

      return cancelledPlan
    } catch (error) {
      console.error("Error cancelling installment plan:", error)
      throw error
    }
  }

  async restructureInstallmentPlan(
    id: string,
    restructureData: { newTerms: number; newInterestRate?: number; reason: string },
    userId: string,
  ): Promise<InstallmentPlan> {
    try {
      const plan = await this.installmentPlanModel.findById(id).exec()

      if (!plan) {
        throw new NotFoundException("Installment plan not found")
      }

      // Calculate new payment schedule
      const remainingAmount = plan.remainingAmount
      const newInterestRate = restructureData.newInterestRate || plan.interestRate
      const monthlyInterestRate = newInterestRate / 12 / 100

      let newInstallmentAmount: number
      let newTotalInterest: number

      if (monthlyInterestRate > 0) {
        const factor = Math.pow(1 + monthlyInterestRate, restructureData.newTerms)
        newInstallmentAmount = (remainingAmount * monthlyInterestRate * factor) / (factor - 1)
        newTotalInterest = newInstallmentAmount * restructureData.newTerms - remainingAmount
      } else {
        newInstallmentAmount = remainingAmount / restructureData.newTerms
        newTotalInterest = 0
      }

      // Update plan with new terms
      plan.numberOfInstallments = restructureData.newTerms
      plan.installmentAmount = newInstallmentAmount
      plan.interestRate = newInterestRate
      plan.totalInterest = newTotalInterest
      plan.totalPayable = plan.paidAmount + newInstallmentAmount * restructureData.newTerms

      // Create new payment schedule for remaining payments
      const newPayments = []
      const startDate = new Date()

      for (let i = 1; i <= restructureData.newTerms; i++) {
        const dueDate = new Date(startDate)
        dueDate.setMonth(dueDate.getMonth() + i)

        newPayments.push({
          installmentNumber: i,
          amount: newInstallmentAmount,
          dueDate,
          status: InstallmentPaymentStatus.PENDING,
          lateFee: 0,
          reminderCount: 0,
        })
      }

      // Replace pending payments with new schedule
      plan.payments = [...plan.payments.filter((p) => p.status === InstallmentPaymentStatus.PAID), ...newPayments]

      plan.notes = `${plan.notes || ""}\nRestructured: ${restructureData.reason}`

      const restructuredPlan = await plan.save()

      // Log audit
      await this.auditService.createAuditLog({
        action: "RESTRUCTURE",
        userId,
        module: "INSTALLMENTS",
        description: `Installment plan restructured: #${plan.planNumber}`,
        changes: JSON.stringify(restructureData),
      })

      return restructuredPlan
    } catch (error) {
      console.error("Error restructuring installment plan:", error)
      throw error
    }
  }

  async sendManualReminders(reminderData: {
    planIds?: string[]
    type: "upcoming" | "overdue"
  }): Promise<{ sent: number; failed: number; details: any[] }> {
    try {
      let plans: InstallmentPlan[]
      const results = { sent: 0, failed: 0, details: [] }

      if (reminderData.planIds && reminderData.planIds.length > 0) {
        // Send reminders for specific plans
        plans = await this.installmentPlanModel
          .find({ _id: { $in: reminderData.planIds.map((id) => new Types.ObjectId(id)) } })
          .populate("customer", "firstName lastName email")
          .exec()
      } else {
        // Send reminders for all applicable plans
        const query: any = { status: InstallmentStatus.ACTIVE }
        plans = await this.installmentPlanModel.find(query).populate("customer", "firstName lastName email").exec()
      }

      for (const plan of plans) {
        try {
          const customer = plan.customer as any
          let remindersSent = 0

          for (const payment of plan.payments) {
            let shouldSendReminder = false

            if (reminderData.type === "overdue") {
              shouldSendReminder =
                payment.status === InstallmentPaymentStatus.OVERDUE ||
                (payment.status === InstallmentPaymentStatus.PENDING && payment.dueDate < new Date())
            } else if (reminderData.type === "upcoming") {
              const reminderDate = new Date()
              reminderDate.setDate(reminderDate.getDate() + 3) // 3 days ahead
              shouldSendReminder =
                payment.status === InstallmentPaymentStatus.PENDING &&
                payment.dueDate <= reminderDate &&
                payment.dueDate > new Date()
            }

            if (shouldSendReminder) {
              if (reminderData.type === "overdue") {
                const daysOverdue = Math.floor(
                  (new Date().getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24),
                )
                await this.emailService.sendInstallmentPaymentReminder(plan, payment, customer, daysOverdue)
              } else {
                const daysUntilDue = Math.ceil(
                  (payment.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                )
                await this.emailService.sendUpcomingInstallmentReminder(plan, payment, customer, daysUntilDue)
              }

              payment.reminderSentAt = new Date()
              payment.reminderCount += 1
              remindersSent++
            }
          }

          if (remindersSent > 0) {
            await plan.save()
            results.sent += remindersSent
            results.details.push({
              planId: plan._id,
              planNumber: plan.planNumber,
              customerEmail: customer.email,
              remindersSent,
            })
          }
        } catch (error) {
          results.failed++
          results.details.push({
            planId: plan._id,
            planNumber: plan.planNumber,
            error: error.message,
          })
        }
      }

      return results
    } catch (error) {
      console.error("Error sending manual reminders:", error)
      throw error
    }
  }

  async getCollectionReport(options: {
    startDate?: Date
    endDate?: Date
    groupBy: "day" | "week" | "month"
  }): Promise<any> {
    try {
      const { startDate, endDate, groupBy } = options
      const matchStage: any = {}

      if (startDate || endDate) {
        matchStage.createdAt = {}
        if (startDate) matchStage.createdAt.$gte = startDate
        if (endDate) matchStage.createdAt.$lte = endDate
      }

      let groupByStage: any
      switch (groupBy) {
        case "day":
          groupByStage = {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          }
          break
        case "week":
          groupByStage = {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" },
          }
          break
        case "month":
        default:
          groupByStage = {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          }
          break
      }

      const collectionData = await this.installmentPlanModel
        .aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: groupByStage,
              totalPlans: { $sum: 1 },
              totalAmount: { $sum: "$totalPayable" },
              collectedAmount: { $sum: "$paidAmount" },
              overdueAmount: { $sum: "$overdueAmount" },
              activePlans: {
                $sum: { $cond: [{ $eq: ["$status", InstallmentStatus.ACTIVE] }, 1, 0] },
              },
              completedPlans: {
                $sum: { $cond: [{ $eq: ["$status", InstallmentStatus.COMPLETED] }, 1, 0] },
              },
              defaultedPlans: {
                $sum: { $cond: [{ $eq: ["$status", InstallmentStatus.DEFAULTED] }, 1, 0] },
              },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
        ])
        .exec()

      return {
        groupBy,
        data: collectionData.map((item) => ({
          period: item._id,
          totalPlans: item.totalPlans,
          totalAmount: item.totalAmount,
          collectedAmount: item.collectedAmount,
          overdueAmount: item.overdueAmount,
          collectionRate: item.totalAmount > 0 ? (item.collectedAmount / item.totalAmount) * 100 : 0,
          activePlans: item.activePlans,
          completedPlans: item.completedPlans,
          defaultedPlans: item.defaultedPlans,
        })),
      }
    } catch (error) {
      console.error("Error generating collection report:", error)
      throw error
    }
  }

  async getInstallmentDashboard(): Promise<any> {
    try {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())

      const [
        totalActivePlans,
        monthlyNewPlans,
        weeklyNewPlans,
        totalCollected,
        monthlyCollected,
        totalOverdue,
        recentDefaulted,
        upcomingPayments,
      ] = await Promise.all([
        this.installmentPlanModel.countDocuments({ status: InstallmentStatus.ACTIVE }).exec(),
        this.installmentPlanModel.countDocuments({ createdAt: { $gte: startOfMonth } }).exec(),
        this.installmentPlanModel.countDocuments({ createdAt: { $gte: startOfWeek } }).exec(),
        this.installmentPlanModel.aggregate([{ $group: { _id: null, total: { $sum: "$paidAmount" } } }]).exec(),
        this.installmentPlanModel
          .aggregate([
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$paidAmount" } } },
          ])
          .exec(),
        this.installmentPlanModel.aggregate([{ $group: { _id: null, total: { $sum: "$overdueAmount" } } }]).exec(),
        this.installmentPlanModel
          .find({ status: InstallmentStatus.DEFAULTED })
          .sort({ defaultedAt: -1 })
          .limit(5)
          .populate("customer", "firstName lastName email")
          .exec(),
        this.getUpcomingPaymentsForDashboard(7), // Next 7 days
      ])

      return {
        summary: {
          totalActivePlans,
          monthlyNewPlans,
          weeklyNewPlans,
          totalCollected: totalCollected[0]?.total || 0,
          monthlyCollected: monthlyCollected[0]?.total || 0,
          totalOverdue: totalOverdue[0]?.total || 0,
        },
        recentDefaulted,
        upcomingPayments,
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      throw error
    }
  }

  private async getUpcomingPaymentsForDashboard(days: number): Promise<any[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    const plans = await this.installmentPlanModel
      .find({ status: InstallmentStatus.ACTIVE })
      .populate("customer", "firstName lastName email")
      .populate("order", "orderNumber")
      .exec()

    const upcomingPayments = []

    for (const plan of plans) {
      for (const payment of plan.payments) {
        if (
          payment.status === InstallmentPaymentStatus.PENDING &&
          payment.dueDate <= futureDate &&
          payment.dueDate > new Date()
        ) {
          upcomingPayments.push({
            planNumber: plan.planNumber,
            customerName: `${(plan.customer as any).firstName} ${(plan.customer as any).lastName}`,
            amount: payment.amount,
            dueDate: payment.dueDate,
            installmentNumber: payment.installmentNumber,
          })
        }
      }
    }

    return upcomingPayments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()).slice(0, 10)
  }

  private async sendDefaultNotification(plan: InstallmentPlan): Promise<void> {
    try {
      const customer = plan.customer as any

      await this.emailService.sendInstallmentDefaultNotification(plan, customer)

      await this.notificationsService.createNotification({
        user: customer._id.toString(),
        title: "Installment Plan Defaulted",
        message: `Your installment plan #${plan.planNumber} has been marked as defaulted due to non-payment.`,
        type: "installment",
        reference: plan._id.toString(),
      })
    } catch (error) {
      console.error("Error sending default notification:", error)
    }
  }

  private generatePlanNumber(): string {
    const prefix = "INST"
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${prefix}-${timestamp}-${random}`
  }
}
