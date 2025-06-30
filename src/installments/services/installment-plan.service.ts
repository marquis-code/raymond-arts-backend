import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { Cron, CronExpression } from "@nestjs/schedule"
import { InstallmentPlan, InstallmentStatus, PaymentFrequency } from "../schemas/installment-plan.schema"
import { InstallmentPayment } from "../schemas/installment-payment.schema"
import { PaymentStatus } from "../../shared/enums/payment-status.enum"
import { InstallmentAgreement, AgreementStatus } from "../schemas/installment-agreement.schema"
import { CreateInstallmentPlanDto } from "../dto/create-installment-plan.dto"
import { UpdateInstallmentPlanDto } from "../dto/update-installment-plan.dto"
import { PaginationParams, PaginatedResult } from "../../common/interfaces/pagination.interface"
import { EmailService } from "../../email/email.service"
import { NotificationsService } from "../../notifications/notifications.service"
import { AuditService } from "../../audit/audit.service"
import { UsersService } from "../../users/users.service"
import * as crypto from "crypto"

@Injectable()
export class InstallmentPlanService {
  findById(arg0: string) {
    throw new Error("Method not implemented.")
  }
  constructor(
    @InjectModel(InstallmentPlan.name) private installmentPlanModel: Model<InstallmentPlan>,
    @InjectModel(InstallmentPayment.name) private installmentPaymentModel: Model<InstallmentPayment>,
    @InjectModel(InstallmentAgreement.name) private installmentAgreementModel: Model<InstallmentAgreement>,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
    private usersService: UsersService,
  ) {}

  async create(createInstallmentPlanDto: CreateInstallmentPlanDto, userId: string): Promise<InstallmentPlan> {
    // Generate plan number
    const planNumber = this.generatePlanNumber()

    // Calculate remaining amount and installment amount
    const remainingAmount = createInstallmentPlanDto.totalAmount - createInstallmentPlanDto.downPayment
    const installmentAmount = this.calculateInstallmentAmount(
      remainingAmount,
      createInstallmentPlanDto.numberOfInstallments,
      createInstallmentPlanDto.interestRate
    )

    // Calculate end date
    const endDate = this.calculateEndDate(
      new Date(createInstallmentPlanDto.startDate),
      createInstallmentPlanDto.numberOfInstallments,
      createInstallmentPlanDto.paymentFrequency
    )

    // Create installment plan
    const newPlan = new this.installmentPlanModel({
      ...createInstallmentPlanDto,
      planNumber,
      remainingAmount,
      installmentAmount,
      endDate,
      status: InstallmentStatus.ACTIVE,
    })

    const savedPlan = await newPlan.save()

    // Create agreement
    const agreement = await this.createAgreement(savedPlan, userId)
    
    // Safely assign agreement ID - let Mongoose handle the conversion
    savedPlan.agreement = agreement._id as any
    await savedPlan.save()

    // Create installment payment schedule
    await this.createPaymentSchedule(savedPlan)

    // Send agreement email
    const customer = await this.usersService.findById(createInstallmentPlanDto.customer)
    await this.sendAgreementEmail(savedPlan, agreement, customer)

    // Log audit
    await this.auditService.createAuditLog({
      action: "CREATE",
      userId,
      module: "INSTALLMENT_PLANS",
      description: `Installment plan created: ${planNumber}`,
    })

    return savedPlan
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<InstallmentPlan>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc", search } = params
    const skip = (page - 1) * limit

    let query = {}
    if (search) {
      query = {
        $or: [
          { planNumber: { $regex: search, $options: "i" } },
          { "customer.firstName": { $regex: search, $options: "i" } },
          { "customer.lastName": { $regex: search, $options: "i" } },
        ],
      }
    }

    const [plans, total] = await Promise.all([
      this.installmentPlanModel
        .find(query)
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("customer", "firstName lastName email")
        .populate("order", "orderNumber")
        .populate("product", "name")
        .populate("agreement")
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
  }

  async findByCustomer(customerId: string, params: PaginationParams): Promise<PaginatedResult<InstallmentPlan>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
    const skip = (page - 1) * limit

    const [plans, total] = await Promise.all([
      this.installmentPlanModel
        .find({ customer: customerId })
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("order", "orderNumber")
        .populate("product", "name")
        .populate("agreement")
        .exec(),
      this.installmentPlanModel.countDocuments({ customer: customerId }).exec(),
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
  }

  async findOne(id: string): Promise<InstallmentPlan> {
    const plan = await this.installmentPlanModel
      .findById(id)
      .populate("customer", "firstName lastName email phone")
      .populate("order", "orderNumber items total")
      .populate("product", "name images")
      .populate("agreement")
      .populate("payments")
      .exec()

    if (!plan) {
      throw new NotFoundException(`Installment plan with ID ${id} not found`)
    }

    return plan
  }

  async update(id: string, updateDto: UpdateInstallmentPlanDto, userId: string): Promise<InstallmentPlan> {
    const plan = await this.findOne(id)

    // If status is being changed to completed
    if (updateDto.status === InstallmentStatus.COMPLETED && plan.status !== InstallmentStatus.COMPLETED) {
      updateDto['completedAt'] = new Date()
    }

    const updatedPlan = await this.installmentPlanModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec()

    // Log audit
    await this.auditService.createAuditLog({
      action: "UPDATE",
      userId,
      module: "INSTALLMENT_PLANS",
      description: `Installment plan updated: ${plan.planNumber}`,
      changes: JSON.stringify(updateDto),
    })

    return updatedPlan
  }

  async updatePaymentProgress(planId: string, paidAmount: number): Promise<InstallmentPlan> {
    const plan = await this.findOne(planId)
    
    plan.paidInstallments += 1
    plan.totalPaid += paidAmount

    // Check if plan is completed
    if (plan.paidInstallments >= plan.numberOfInstallments) {
      plan.status = InstallmentStatus.COMPLETED
      plan.completedAt = new Date()

      // Send completion notification
      await this.notificationsService.createNotification({
        user: plan.customer.toString(),
        title: "Installment Plan Completed",
        message: `Your installment plan ${plan.planNumber} has been completed successfully.`,
        type: "installment",
        reference: plan._id.toString(),
      })
    }

    return plan.save()
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendPaymentReminders(): Promise<void> {
    console.log("Running payment reminder cron job...")

    const today = new Date()
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)

    // Find pending payments due in 1 week or 2 weeks
    const upcomingPayments = await this.installmentPaymentModel
      .find({
        status: PaymentStatus.PENDING,
        dueDate: {
          $gte: oneWeekFromNow,
          $lte: twoWeeksFromNow,
        },
      })
      .populate("customer", "firstName lastName email")
      .populate("installmentPlan", "planNumber paymentMethod")
      .exec()

    for (const payment of upcomingPayments) {
      const daysToDue = Math.ceil((new Date(payment.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      // Send reminder based on days to due date
      if ((daysToDue === 7 || daysToDue === 14) && payment.remindersSent < 2) {
        await this.sendPaymentReminderEmail(payment, daysToDue)
        
        // Update reminder count
        payment.remindersSent += 1
        payment.lastReminderSent = new Date()
        await payment.save()
      }
    }

    // Check for overdue payments
    await this.checkOverduePayments()
  }

  private async createAgreement(plan: InstallmentPlan, userId: string): Promise<InstallmentAgreement> {
    const agreementNumber = this.generateAgreementNumber()
    const agreementText = this.generateAgreementText(plan)
    const termsAndConditions = this.generateTermsAndConditions()
    const agreementHash = crypto.createHash('sha256').update(agreementText + termsAndConditions).digest('hex')

    const agreement = new this.installmentAgreementModel({
      agreementNumber,
      customer: plan.customer,
      installmentPlan: plan._id,
      agreementText,
      termsAndConditions,
      status: AgreementStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      agreementHash,
      agreementData: {
        planNumber: plan.planNumber,
        totalAmount: plan.totalAmount,
        installmentAmount: plan.installmentAmount,
        numberOfInstallments: plan.numberOfInstallments,
        paymentFrequency: plan.paymentFrequency,
      },
    })

    return agreement.save()
  }

  private async createPaymentSchedule(plan: InstallmentPlan): Promise<void> {
    const payments = []
    const startDate = new Date(plan.startDate)

    for (let i = 1; i <= plan.numberOfInstallments; i++) {
      const dueDate = this.calculatePaymentDueDate(startDate, i, plan.paymentFrequency)
      const paymentNumber = this.generatePaymentNumber(plan.planNumber, i)

      const payment = new this.installmentPaymentModel({
        paymentNumber,
        installmentPlan: plan._id,
        customer: plan.customer,
        installmentNumber: i,
        amount: plan.installmentAmount,
        dueDate,
        status: PaymentStatus.PENDING,
      })

      const savedPayment = await payment.save()
      payments.push(savedPayment._id)
    }

    plan.payments = payments
    await plan.save()
  }

  private calculateInstallmentAmount(amount: number, installments: number, interestRate: number): number {
    if (interestRate === 0) {
      return amount / installments
    }

    const monthlyRate = interestRate / 100 / 12
    const numerator = amount * monthlyRate * Math.pow(1 + monthlyRate, installments)
    const denominator = Math.pow(1 + monthlyRate, installments) - 1
    
    return numerator / denominator
  }

  private calculateEndDate(startDate: Date, installments: number, frequency: PaymentFrequency): Date {
    const endDate = new Date(startDate)

    switch (frequency) {
      case PaymentFrequency.WEEKLY:
        endDate.setDate(startDate.getDate() + (installments * 7))
        break
      case PaymentFrequency.BIWEEKLY:
        endDate.setDate(startDate.getDate() + (installments * 14))
        break
      case PaymentFrequency.MONTHLY:
        endDate.setMonth(startDate.getMonth() + installments)
        break
    }

    return endDate
  }

  private calculatePaymentDueDate(startDate: Date, installmentNumber: number, frequency: PaymentFrequency): Date {
    const dueDate = new Date(startDate)

    switch (frequency) {
      case PaymentFrequency.WEEKLY:
        dueDate.setDate(startDate.getDate() + ((installmentNumber - 1) * 7))
        break
      case PaymentFrequency.BIWEEKLY:
        dueDate.setDate(startDate.getDate() + ((installmentNumber - 1) * 14))
        break
      case PaymentFrequency.MONTHLY:
        dueDate.setMonth(startDate.getMonth() + (installmentNumber - 1))
        break
    }

    return dueDate
  }

  private async sendAgreementEmail(plan: InstallmentPlan, agreement: InstallmentAgreement, customer: any): Promise<void> {
    const agreementData = {
      customer,
      plan,
      agreement,
      acceptUrl: `${process.env.FRONTEND_URL}/installments/agreement/${agreement._id}/accept`,
      rejectUrl: `${process.env.FRONTEND_URL}/installments/agreement/${agreement._id}/reject`,
    }

    await this.emailService.sendEmail(
      customer.email,
      "Installment Plan Agreement",
      "installment-agreement",
      agreementData
    )
  }

  private async sendPaymentReminderEmail(payment: any, daysToDue: number): Promise<void> {
    const reminderData = {
      customer: payment.customer,
      payment,
      plan: payment.installmentPlan,
      daysToDue,
      paymentUrl: `${process.env.FRONTEND_URL}/installments/payments/${payment._id}`,
    }

    await this.emailService.sendEmail(
      payment.customer.email,
      `Payment Reminder - ${daysToDue} days remaining`,
      "payment-reminder",
      reminderData
    )

    // Send notification
    await this.notificationsService.createNotification({
      user: payment.customer._id.toString(),
      title: "Payment Reminder",
      message: `Your installment payment of $${payment.amount} is due in ${daysToDue} days.`,
      type: "payment",
      reference: payment._id.toString(),
    })
  }

  private async checkOverduePayments(): Promise<void> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const overduePayments = await this.installmentPaymentModel
      .find({
        status: PaymentStatus.PENDING,
        dueDate: { $lt: today },
      })
      .populate("customer", "firstName lastName email")
      .exec()

    for (const payment of overduePayments) {
      if (payment.status !== PaymentStatus.OVERDUE) {
    const customerId = payment.customer instanceof Types.ObjectId 
      ? payment.customer.toString() 
      : (payment.customer as any)._id?.toString() || payment.customer.toString()

        payment.status = PaymentStatus.OVERDUE
        await payment.save()

        // Send overdue notification
        await this.notificationsService.createNotification({
          user: customerId,
          title: "Payment Overdue",
          message: `Your installment payment of $${payment.amount} is now overdue.`,
          type: "payment",
          reference: payment._id.toString(),
        })
      }
    }
  }

  private generatePlanNumber(): string {
    const prefix = "INS"
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
    return `${prefix}-${timestamp}-${random}`
  }

  private generateAgreementNumber(): string {
    const prefix = "AGR"
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
    return `${prefix}-${timestamp}-${random}`
  }

  private generatePaymentNumber(planNumber: string, installmentNumber: number): string {
    return `${planNumber}-P${installmentNumber.toString().padStart(2, "0")}`
  }

  private generateAgreementText(plan: InstallmentPlan): string {
    return `
INSTALLMENT PAYMENT AGREEMENT

Agreement Number: ${this.generateAgreementNumber()}
Plan Number: ${plan.planNumber}

This agreement is entered into between the Customer and [Your Company Name] for the purchase of goods/services through an installment payment plan.

PAYMENT DETAILS:
- Total Amount: $${plan.totalAmount.toFixed(2)}
- Down Payment: $${plan.downPayment.toFixed(2)}
- Remaining Amount: $${plan.remainingAmount.toFixed(2)}
- Number of Installments: ${plan.numberOfInstallments}
- Installment Amount: $${plan.installmentAmount.toFixed(2)}
- Payment Frequency: ${plan.paymentFrequency}
- Interest Rate: ${plan.interestRate}%
- Start Date: ${plan.startDate.toLocaleDateString()}
- End Date: ${plan.endDate.toLocaleDateString()}

The customer agrees to make payments according to this schedule.
    `
  }

  private generateTermsAndConditions(): string {
    return `
TERMS AND CONDITIONS

1. PAYMENT OBLIGATIONS
The Customer agrees to make all payments on time according to the payment schedule.

2. LATE PAYMENTS
Late payments may incur additional fees and interest charges.

3. DEFAULT
Failure to make payments may result in cancellation of the agreement and collection actions.

4. MODIFICATION
This agreement may only be modified in writing with mutual consent.

5. GOVERNING LAW
This agreement is governed by applicable laws.

By accepting this agreement, the Customer acknowledges understanding and agreement to these terms.
    `
  }
}