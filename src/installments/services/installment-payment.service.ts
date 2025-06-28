import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { InstallmentPayment } from "../schemas/installment-payment.schema"
import { PaymentStatus } from "../../shared/enums/payment-status.enum"
import { InstallmentPlan, InstallmentStatus, PaymentMethod } from "../schemas/installment-plan.schema"
// import { CreateInstallmentPaymentDto } from "../dto/create-installment-payment.dto"
import { ProcessPaymentDto } from "../dto/process-payment.dto"
import { TransactionsService } from "../../transactions/transactions.service"
import { TransactionType } from "../../transactions/enums/transaction-type.enum"
import { TransactionStatus } from "../../transactions/enums/transaction-status.enum"
import { PaymentContext } from "../../transactions/schemas/transaction.schema"
import { NotificationsService } from "../../notifications/notifications.service"
import { EmailService } from "../../email/email.service"
import { AuditService } from "../../audit/audit.service"
import { InstallmentPlanService } from "./installment-plan.service"

@Injectable()
export class InstallmentPaymentService {
  constructor(
    @InjectModel(InstallmentPayment.name) private installmentPaymentModel: Model<InstallmentPayment>,
    @InjectModel(InstallmentPlan.name) private installmentPlanModel: Model<InstallmentPlan>,
    private transactionsService: TransactionsService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private auditService: AuditService,
    private installmentPlanService: InstallmentPlanService,
  ) {}

  async processPayment(paymentId: string, processPaymentDto: ProcessPaymentDto, userId: string): Promise<InstallmentPayment> {
    const payment = await this.installmentPaymentModel
      .findById(paymentId)
      .populate("installmentPlan")
      .populate("customer", "firstName lastName email")
      .exec()

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`)
    }

    if (payment.status !== PaymentStatus.PENDING && payment.status !== PaymentStatus.OVERDUE) {
      throw new BadRequestException("Payment has already been processed or cancelled")
    }

    try {
      // Extract customer ID safely
      const customerId = payment.customer instanceof Types.ObjectId 
        ? payment.customer.toString() 
        : (payment.customer as any)._id?.toString() || payment.customer.toString()

      // Extract installment plan ID safely
      const installmentPlanId = payment.installmentPlan instanceof Types.ObjectId 
        ? payment.installmentPlan.toString() 
        : (payment.installmentPlan as any)._id?.toString() || payment.installmentPlan.toString()

      // Get plan number safely
      const planNumber = (payment.installmentPlan as any)?.planNumber || 'Unknown Plan'

      // Create transaction
      const transaction = await this.transactionsService.create({
        user: customerId,
        type: TransactionType.PAYMENT,
        amount: payment.amount,
        installmentPlan: installmentPlanId,
        paymentContext: PaymentContext.INSTALLMENT_PAYMENT,
        installmentNumber: payment.installmentNumber,
        paymentMethod: processPaymentDto.paymentMethod || "manual",
        paymentReference: processPaymentDto.paymentReference,
        description: `Installment payment ${payment.installmentNumber} for plan ${planNumber}`,
        metadata: processPaymentDto.paymentDetails || {},
      })

      // Update payment status
      payment.status = PaymentStatus.PAID
      payment.paidDate = new Date()
      
      // Safely assign transaction ID - use the string directly since Mongoose will convert it
      if (transaction._id) {
        payment.transaction = transaction._id as any
      }
      
      payment.paymentMethod = processPaymentDto.paymentMethod
      payment.paymentReference = processPaymentDto.paymentReference
      payment.paymentDetails = processPaymentDto.paymentDetails || {}

      const savedPayment = await payment.save()

      // Update transaction status - safely extract transaction ID
      const transactionId = transaction._id?.toString() || transaction.id?.toString()
      if (transactionId) {
        await this.transactionsService.updateStatus(transactionId, TransactionStatus.SUCCESSFUL)
      }

      // Update installment plan progress
      await this.installmentPlanService.updatePaymentProgress(installmentPlanId, payment.amount)

      // Send confirmation email
      await this.sendPaymentConfirmationEmail(savedPayment)

      // Send notification
      await this.notificationsService.createNotification({
        user: customerId,
        title: "Payment Processed",
        message: `Your installment payment of $${payment.amount} has been processed successfully.`,
        type: "payment",
        reference: payment._id.toString(),
      })

      // Log audit
      await this.auditService.createAuditLog({
        action: "PROCESS_PAYMENT",
        userId,
        module: "INSTALLMENT_PAYMENTS",
        description: `Payment processed: ${payment.paymentNumber}`,
        changes: JSON.stringify(processPaymentDto),
      })

      return savedPayment

    } catch (error) {
      // Handle payment failure
      payment.status = PaymentStatus.FAILED
      payment.failureReason = error.message
      await payment.save()

      // Extract customer ID safely for notification
      const customerId = payment.customer instanceof Types.ObjectId 
        ? payment.customer.toString() 
        : (payment.customer as any)._id?.toString() || payment.customer.toString()

      // Send failure notification
      await this.notificationsService.createNotification({
        user: customerId,
        title: "Payment Failed",
        message: `Your installment payment of $${payment.amount} could not be processed.`,
        type: "payment",
        reference: payment._id.toString(),
      })

      throw new BadRequestException(`Payment processing failed: ${error.message}`)
    }
  }

//   async processPayment(paymentId: string, processPaymentDto: ProcessPaymentDto, userId: string): Promise<InstallmentPayment> {
//     const payment = await this.installmentPaymentModel
//       .findById(paymentId)
//       .populate("installmentPlan")
//       .populate("customer", "firstName lastName email")
//       .exec()

//     if (!payment) {
//       throw new NotFoundException(`Payment with ID ${paymentId} not found`)
//     }

//     if (payment.status !== PaymentStatus.PENDING && payment.status !== PaymentStatus.OVERDUE) {
//       throw new BadRequestException("Payment has already been processed or cancelled")
//     }

//     try {
//       // Create transaction
//       const transaction = await this.transactionsService.create({
//         user: payment.customer._id.toString(),
//         type: TransactionType.PAYMENT,
//         amount: payment.amount,
//         installmentPlan: payment.installmentPlan._id.toString(),
//         paymentContext: PaymentContext.INSTALLMENT_PAYMENT,
//         installmentNumber: payment.installmentNumber,
//         paymentMethod: processPaymentDto.paymentMethod || "manual",
//         paymentReference: processPaymentDto.paymentReference,
//         description: `Installment payment ${payment.installmentNumber} for plan ${payment.installmentPlan.planNumber}`,
//         metadata: processPaymentDto.paymentDetails || {},
//       })

//       // Update payment status
//       payment.status = PaymentStatus.PAID
//       payment.paidDate = new Date()
//       payment.transaction = transaction._id
//       payment.paymentMethod = processPaymentDto.paymentMethod
//       payment.paymentReference = processPaymentDto.paymentReference
//       payment.paymentDetails = processPaymentDto.paymentDetails || {}

//       const savedPayment = await payment.save()

//       // Update transaction status
//       await this.transactionsService.updateStatus(transaction._id.toString(), TransactionStatus.SUCCESSFUL)

//       // Update installment plan progress
//       await this.installmentPlanService.updatePaymentProgress(payment.installmentPlan._id.toString(), payment.amount)

//       // Send confirmation email
//       await this.sendPaymentConfirmationEmail(savedPayment)

//       // Send notification
//       await this.notificationsService.createNotification({
//         user: payment.customer._id.toString(),
//         title: "Paymen3t Processed",
//         message: `Your installment payment of $${payment.amount} has been processed successfully.`,
//         type: "payment",
//         reference: payment._id.toString(),
//       })

//       // Log audit
//       await this.auditService.createAuditLog({
//         action: "PROCESS_PAYMENT",
//         userId,
//         module: "INSTALLMENT_PAYMENTS",
//         description: `Payment processed: ${payment.paymentNumber}`,
//         changes: JSON.stringify(processPaymentDto),
//       })

//       return savedPayment

//     } catch (error) {
//       // Handle payment failure
//       payment.status = PaymentStatus.FAILED
//       payment.failureReason = error.message
//       await payment.save()

//       // Send failure notification
//       await this.notificationsService.createNotification({
//         user: payment.customer._id.toString(),
//         title: "Payment Failed",
//         message: `Your installment payment of $${payment.amount} could not be processed.`,
//         type: "payment",
//         reference: payment._id.toString(),
//       })

//       throw new BadRequestException(`Payment processing failed: ${error.message}`)
//     }
//   }

// async processPayment(paymentId: string, processPaymentDto: ProcessPaymentDto, userId: string): Promise<InstallmentPayment> {
//     const payment = await this.installmentPaymentModel
//       .findById(paymentId)
//       .populate("installmentPlan")
//       .populate("customer", "firstName lastName email")
//       .exec()

//     if (!payment) {
//       throw new NotFoundException(`Payment with ID ${paymentId} not found`)
//     }

//     if (payment.status !== PaymentStatus.PENDING && payment.status !== PaymentStatus.OVERDUE) {
//       throw new BadRequestException("Payment has already been processed or cancelled")
//     }

//     try {
//       // Extract customer ID safely
//       const customerId = payment.customer instanceof Types.ObjectId 
//         ? payment.customer.toString() 
//         : (payment.customer as any)._id?.toString() || payment.customer.toString()

//       // Extract installment plan ID safely
//       const installmentPlanId = payment.installmentPlan instanceof Types.ObjectId 
//         ? payment.installmentPlan.toString() 
//         : (payment.installmentPlan as any)._id?.toString() || payment.installmentPlan.toString()

//       // Get plan number safely
//       const planNumber = (payment.installmentPlan as any)?.planNumber || 'Unknown Plan'

//       // Create transaction
//       const transaction = await this.transactionsService.create({
//         user: customerId,
//         type: TransactionType.PAYMENT,
//         amount: payment.amount,
//         installmentPlan: installmentPlanId,
//         paymentContext: PaymentContext.INSTALLMENT_PAYMENT,
//         installmentNumber: payment.installmentNumber,
//         paymentMethod: processPaymentDto.paymentMethod || "manual",
//         paymentReference: processPaymentDto.paymentReference,
//         description: `Installment payment ${payment.installmentNumber} for plan ${planNumber}`,
//         metadata: processPaymentDto.paymentDetails || {},
//       })

//       // Update payment status
//       payment.status = PaymentStatus.PAID
//       payment.paidDate = new Date()
//       payment.transaction = new Types.ObjectId(transaction._id.toString())
//       payment.paymentMethod = processPaymentDto.paymentMethod
//       payment.paymentReference = processPaymentDto.paymentReference
//       payment.paymentDetails = processPaymentDto.paymentDetails || {}

//       const savedPayment = await payment.save()

//       // Update transaction status
//       await this.transactionsService.updateStatus(transaction._id.toString(), TransactionStatus.SUCCESSFUL)

//       // Update installment plan progress
//       await this.installmentPlanService.updatePaymentProgress(installmentPlanId, payment.amount)

//       // Send confirmation email
//       await this.sendPaymentConfirmationEmail(savedPayment)

//       // Send notification
//       await this.notificationsService.createNotification({
//         user: customerId,
//         title: "Payment Processed",
//         message: `Your installment payment of $${payment.amount} has been processed successfully.`,
//         type: "payment",
//         reference: payment._id.toString(),
//       })

//       // Log audit
//       await this.auditService.createAuditLog({
//         action: "PROCESS_PAYMENT",
//         userId,
//         module: "INSTALLMENT_PAYMENTS",
//         description: `Payment processed: ${payment.paymentNumber}`,
//         changes: JSON.stringify(processPaymentDto),
//       })

//       return savedPayment

//     } catch (error) {
//       // Handle payment failure
//       payment.status = PaymentStatus.FAILED
//       payment.failureReason = error.message
//       await payment.save()

//       // Extract customer ID safely for notification
//       const customerId = payment.customer instanceof Types.ObjectId 
//         ? payment.customer.toString() 
//         : (payment.customer as any)._id?.toString() || payment.customer.toString()

//       // Send failure notification
//       await this.notificationsService.createNotification({
//         user: customerId,
//         title: "Payment Failed",
//         message: `Your installment payment of $${payment.amount} could not be processed.`,
//         type: "payment",
//         reference: payment._id.toString(),
//       })

//       throw new BadRequestException(`Payment processing failed: ${error.message}`)
//     }
//   }

  async processAutoPayment(paymentId: string): Promise<InstallmentPayment> {
    const payment = await this.installmentPaymentModel
      .findById(paymentId)
      .populate("installmentPlan")
      .populate("customer", "firstName lastName email")
      .exec()

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`)
    }

    const plan = payment.installmentPlan as any

    if (plan.paymentMethod !== PaymentMethod.AUTO_DEDUCTION) {
      throw new BadRequestException("This payment is not set up for auto-deduction")
    }

    if (!plan.cardToken) {
      throw new BadRequestException("No payment method on file for auto-deduction")
    }

    // Here you would integrate with your payment processor (Stripe, PayPal, etc.)
    // For now, we'll simulate the payment process
    try {
      // Simulate payment gateway call
      const paymentResult = await this.simulateAutoPayment(plan.cardToken, payment.amount)

      return this.processPayment(paymentId, {
        paymentId: paymentId,
        paymentReference: paymentResult.transactionId,
        paymentMethod: "auto_deduction",
        paymentDetails: paymentResult,
      }, "system")

    } catch (error) {
      // Handle auto-payment failure
        // Extract customer ID safely
        const customerId = payment.customer instanceof Types.ObjectId 
        ? payment.customer.toString() 
        : (payment.customer as any)._id?.toString() || payment.customer.toString()

      payment.status = PaymentStatus.FAILED
      payment.failureReason = `Auto-payment failed: ${error.message}`
      await payment.save()

      // Notify customer of auto-payment failure
      await this.notificationsService.createNotification({
        user: customerId,
        title: "Auto-Payment Failed",
        message: `Your automatic payment of $${payment.amount} could not be processed. Please update your payment method.`,
        type: "payment",
        reference: payment._id.toString(),
      })

      throw error
    }
  }

  async findUpcomingPayments(customerId: string): Promise<InstallmentPayment[]> {
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    return this.installmentPaymentModel
      .find({
        customer: customerId,
        status: PaymentStatus.PENDING,
        dueDate: { $lte: thirtyDaysFromNow },
      })
      .populate("installmentPlan", "planNumber productSize")
      .sort({ dueDate: 1 })
      .exec()
  }

  async findOverduePayments(customerId?: string): Promise<InstallmentPayment[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const query: any = {
      status: PaymentStatus.OVERDUE,
      dueDate: { $lt: today },
    }

    if (customerId) {
      query.customer = customerId
    }

    return this.installmentPaymentModel
      .find(query)
      .populate("customer", "firstName lastName email")
      .populate("installmentPlan", "planNumber")
      .sort({ dueDate: 1 })
      .exec()
  }

  private async simulateAutoPayment(cardToken: string, amount: number): Promise<any> {
    // This is a simulation - replace with actual payment gateway integration
    const success = Math.random() > 0.1 // 90% success rate for simulation

    if (success) {
      return {
        transactionId: `auto_${Date.now()}`,
        status: "success",
        amount,
        processingFee: amount * 0.029, // 2.9% processing fee
        timestamp: new Date(),
      }
    } else {
      throw new Error("Card declined or insufficient funds")
    }
  }

  private async sendPaymentConfirmationEmail(payment: any): Promise<void> {
    const emailData = {
      customer: payment.customer,
      payment,
      plan: payment.installmentPlan,
    }

    await this.emailService.sendEmail(
      payment.customer.email,
      "Payment Confirmation",
      "payment-confirmation",
      emailData
    )
  }
}