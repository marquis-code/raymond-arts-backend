import { Injectable, BadRequestException, ForbiddenException } from "@nestjs/common"
import { Types } from "mongoose"
import { ConfigService } from "@nestjs/config"
import type { ProcessPaymentDto } from "./dto/process-payment.dto"
import type { VerifyPaymentDto } from "./dto/verify-payment.dto"
import { TransactionsService } from "../transactions/transactions.service"
import { OrdersService } from "../orders/orders.service"
import { UsersService } from "../users/users.service"
import { EmailService } from "../email/email.service"
import { AuditService } from "../audit/audit.service"
import { NotificationsService } from "../notifications/notifications.service"
import { TransactionType } from "../transactions/enums/transaction-type.enum"
import { TransactionStatus } from "../transactions/enums/transaction-status.enum"
import { PaymentStatus } from "../orders/enums/payment-status.enum"

interface PaymentFilterOptions {
  page: number;
  limit: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
}

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
    const transaction = await this.transactionsService.findByTransactionId(verifyPaymentDto.transactionId) as any
    
    // Verify transaction belongs to user - FIXED COMPARISON
    // Simply compare the string representations
    if (transaction.user._id.toString() !== userId) {
      throw new BadRequestException("Transaction does not belong to this user");
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
          // Extract order ID correctly
          const orderId = transaction.order._id ? transaction.order._id.toString() : transaction.order.toString();
          
          await this.ordersService.updatePaymentStatus(
            orderId,
            PaymentStatus.PAID,
            transaction._id.toString(),
            userId,
          )
  
          // Get order details
          const order = await this.ordersService.findOne(orderId)
  
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
            reference: orderId,
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

  async getAllPayments(userId: string, options: PaymentFilterOptions) {
    try {
      // Check if user exists
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new ForbiddenException('User not found');
      }

      // Build filter query
      const filter: any = { user: userId };

      // Add status filter if provided
      if (options.status) {
        filter.status = options.status;
      }

      // Add payment method filter if provided
      if (options.paymentMethod) {
        filter.paymentMethod = options.paymentMethod;
      }

      // Add date range filter if provided
      if (options.startDate || options.endDate) {
        filter.createdAt = {};
        
        if (options.startDate) {
          filter.createdAt.$gte = new Date(options.startDate);
        }
        
        if (options.endDate) {
          filter.createdAt.$lte = new Date(options.endDate);
        }
      }

      // Calculate pagination
      const skip = (options.page - 1) * options.limit;
      
      // Get total count for pagination
      // const totalCount = await this.transactionsService.countDocuments(filter);
      const totalCount = await this.transactionsService.getCount(filter);
      
      // Get transactions with pagination
      // const transactions = await this.transactionsService.findAll(filter, {
      //   skip,
      //   limit: options.limit,
      //   sort: { createdAt: -1 } // Sort by most recent first
      // });
// If findAll accepts options as part of the filter object
        const transactions = await this.transactionsService.findAll({
          ...filter,
          skip,
          limit: options.limit,
          sort: { createdAt: -1 }
        });

      // Log audit
      await this.auditService.createAuditLog({
        action: "VIEW_PAYMENTS",
        userId,
        module: "PAYMENTS",
        description: `User viewed payments list`,
      });

      return {
        success: true,
        data: {
          transactions,
          pagination: {
            total: totalCount,
            page: options.page,
            limit: options.limit,
            pages: Math.ceil(totalCount / options.limit)
          }
        }
      };
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
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

