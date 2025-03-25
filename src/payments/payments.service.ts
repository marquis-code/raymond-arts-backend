import { Injectable, BadRequestException } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import type { ProcessPaymentDto } from "./dto/process-payment.dto"
import type { VerifyPaymentDto } from "./dto/verify-payment.dto"
import type { TransactionsService } from "../transactions/transactions.service"
import type { OrdersService } from "../orders/orders.service"
import type { UsersService } from "../users/users.service"
import type { EmailService } from "../email/email.service"
import type { AuditService } from "../audit/audit.service"
import type { NotificationsService } from "../notifications/notifications.service"
import { TransactionType } from "../transactions/enums/transaction-type.enum"
import { TransactionStatus } from "../transactions/enums/transaction-status.enum"
import { PaymentStatus } from "../orders/enums/payment-status.enum"

@Injectable()
export class PaymentsService {
  constructor(
    private configService: ConfigService,
    private transactionsService: TransactionsService,
    private ordersService: OrdersService,
    private usersService: UsersService,
    private emailService: EmailService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
  ) {}

  async processPayment(processPaymentDto: ProcessPaymentDto, userId: string) {
    // Get order details
    const order = await this.ordersService.findOne(processPaymentDto.orderId)

    // Verify order belongs to user
    if (order.customer.toString() !== userId) {
      throw new BadRequestException("Order does not belong to this user")
    }

    // Check if order is already paid
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException("Order is already paid")
    }

    // Create transaction
    const transaction = await this.transactionsService.create({
      user: userId,
      type: TransactionType.PAYMENT,
      amount: order.total,
      status: TransactionStatus.PENDING,
      order: order._id.toString(),
      paymentMethod: processPaymentDto.paymentMethod,
      paymentReference: processPaymentDto.paymentReference,
      currency: "USD",
      metadata: processPaymentDto.metadata,
      description: `Payment for order #${order.orderNumber}`,
    })

    // For Flutterwave integration
    if (processPaymentDto.paymentMethod === "flutterwave") {
      // In a real implementation, you would integrate with Flutterwave API here
      // For now, we'll simulate a successful payment
      const flutterwaveResponse = await this.simulateFlutterwavePayment(order, transaction, userId)

      // Update transaction with payment reference
      await this.transactionsService.update(transaction._id.toString(), {
        paymentReference: flutterwaveResponse.reference,
        gatewayResponse: "Approved",
        status: TransactionStatus.SUCCESSFUL,
      })

      // Update order payment status
      await this.ordersService.updatePaymentStatus(
        order._id.toString(),
        PaymentStatus.PAID,
        transaction._id.toString(),
        userId,
      )

      // Send email notification
      const user = await this.usersService.findById(userId)
      await this.emailService.sendPaymentReceipt(
        {
          amount: order.total,
          reference: flutterwaveResponse.reference,
          date: new Date(),
          orderNumber: order.orderNumber,
        },
        user,
      )

      // Send notification
      await this.notificationsService.createNotification({
        user: userId,
        title: "Payment Successful",
        message: `Your payment for order #${order.orderNumber} was successful.`,
        type: "payment",
        reference: order._id.toString(),
      })

      // Log audit
      await this.auditService.createAuditLog({
        action: "PAYMENT",
        userId,
        module: "PAYMENTS",
        description: `Payment successful for order #${order.orderNumber}`,
      })

      return {
        success: true,
        message: "Payment successful",
        data: {
          transactionId: transaction.transactionId,
          reference: flutterwaveResponse.reference,
          amount: order.total,
          orderNumber: order.orderNumber,
        },
      }
    }

    // For other payment methods, return transaction details
    return {
      success: true,
      message: "Payment initiated",
      data: {
        transactionId: transaction.transactionId,
        amount: order.total,
        orderNumber: order.orderNumber,
      },
    }
  }

  async verifyPayment(verifyPaymentDto: VerifyPaymentDto, userId: string) {
    // Get transaction details
    const transaction = await this.transactionsService.findByTransactionId(verifyPaymentDto.transactionId)

    // Verify transaction belongs to user
    if (transaction.user.toString() !== userId) {
      throw new BadRequestException("Transaction does not belong to this user")
    }

    // For Flutterwave integration
    if (transaction.paymentMethod === "flutterwave") {
      // In a real implementation, you would verify with Flutterwave API here
      // For now, we'll simulate a successful verification
      const isVerified = true

      if (isVerified) {
        // Update transaction status
        await this.transactionsService.updateStatus(transaction._id.toString(), TransactionStatus.SUCCESSFUL)

        // Update order payment status
        if (transaction.order) {
          await this.ordersService.updatePaymentStatus(
            transaction.order.toString(),
            PaymentStatus.PAID,
            transaction._id.toString(),
            userId,
          )

          // Get order details
          const order = await this.ordersService.findOne(transaction.order.toString())

          // Send email notification
          const user = await this.usersService.findById(userId)
          await this.emailService.sendPaymentReceipt(
            {
              amount: transaction.amount,
              reference: verifyPaymentDto.reference,
              date: new Date(),
              orderNumber: order.orderNumber,
            },
            user,
          )

          // Send notification
          await this.notificationsService.createNotification({
            user: userId,
            title: "Payment Verified",
            message: `Your payment for order #${order.orderNumber} has been verified.`,
            type: "payment",
            reference: order._id.toString(),
          })
        }

        // Log audit
        await this.auditService.createAuditLog({
          action: "PAYMENT_VERIFY",
          userId,
          module: "PAYMENTS",
          description: `Payment verified for transaction ${transaction.transactionId}`,
        })

        return {
          success: true,
          message: "Payment verified successfully",
          data: {
            transactionId: transaction.transactionId,
            status: TransactionStatus.SUCCESSFUL,
          },
        }
      } else {
        // Update transaction status
        await this.transactionsService.updateStatus(transaction._id.toString(), TransactionStatus.FAILED)

        return {
          success: false,
          message: "Payment verification failed",
          data: {
            transactionId: transaction.transactionId,
            status: TransactionStatus.FAILED,
          },
        }
      }
    }

    // For other payment methods
    return {
      success: false,
      message: "Payment method not supported for verification",
    }
  }

  async handleFlutterwaveWebhook(payload: any) {
    // Verify webhook signature
    const isValidSignature = this.verifyFlutterwaveWebhook(payload)

    if (!isValidSignature) {
      throw new BadRequestException("Invalid webhook signature")
    }

    const { data } = payload

    // Find transaction by payment reference
    try {
      const transaction = await this.transactionsService.findOne(data.tx_ref)

      // Update transaction status based on webhook data
      if (data.status === "successful") {
        await this.transactionsService.updateStatus(transaction._id.toString(), TransactionStatus.SUCCESSFUL)

        // Update order payment status
        if (transaction.order) {
          await this.ordersService.updatePaymentStatus(
            transaction.order.toString(),
            PaymentStatus.PAID,
            transaction._id.toString(),
            transaction.user.toString(),
          )
        }

        // Send notification
        await this.notificationsService.createNotification({
          user: transaction.user.toString(),
          title: "Payment Successful",
          message: `Your payment of ${data.amount} ${data.currency} was successful.`,
          type: "payment",
          reference: transaction._id.toString(),
        })
      } else {
        await this.transactionsService.updateStatus(transaction._id.toString(), TransactionStatus.FAILED)

        // Send notification
        await this.notificationsService.createNotification({
          user: transaction.user.toString(),
          title: "Payment Failed",
          message: `Your payment of ${data.amount} ${data.currency} failed.`,
          type: "payment",
          reference: transaction._id.toString(),
        })
      }

      return { received: true }
    } catch (error) {
      // Transaction not found, log the webhook for manual review
      console.error("Webhook received for unknown transaction:", data)
      return { received: true, error: "Transaction not found" }
    }
  }

  private async simulateFlutterwavePayment(order: any, transaction: any, userId: string) {
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
        amount: order.total,
        currency: "USD",
        charged_amount: order.total,
        app_fee: order.total * 0.015,
        merchant_fee: 0,
        processor_response: "Approved",
        auth_model: "PIN",
        ip: "N/A",
        narration: `Payment for order #${order.orderNumber}`,
        status: "successful",
        payment_type: "card",
        created_at: new Date().toISOString(),
        account_id: 1234,
      },
      reference: `FLW-REF-${Math.floor(Math.random() * 1000000000)}`,
    }
  }

  private verifyFlutterwaveWebhook(payload: any): boolean {
    // In a real implementation, you would verify the webhook signature
    // For now, we'll assume it's valid
    return true
  }
}

