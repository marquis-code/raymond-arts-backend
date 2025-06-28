import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  InstallmentPlan,
  InstallmentStatus,
  PaymentFrequency,
} from '../installments/schemas/installment-plan.schema';
import { InstallmentPayment } from '../installments/schemas/installment-payment.schema';
import { PaymentStatus } from '../shared/enums/payment-status.enum';
import { Product } from '../products/schemas/product.schema';
import { Order } from '../orders/schemas/order.schema';
import { UsersService } from '../users/users.service';
import { EmailService } from '../installments/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UpdateInstallmentPlanDto } from '../installments/dto/update-installment-plan.dto';
import { AuditService } from '../audit/audit.service';
import { CreateInstallmentPlanDto } from '../installments/dto/create-installment-plan.dto';
import { ProcessInstallmentPaymentDto } from '../installments/dto/process-installment-payment.dto';

@Injectable()
export class InstallmentsService {
  constructor(
    @InjectModel(InstallmentPlan.name)
    private installmentPlanModel: Model<InstallmentPlan>,
    @InjectModel(InstallmentPayment.name)
    private installmentPaymentModel: Model<InstallmentPayment>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private usersService: UsersService,
    private emailService: EmailService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
    private transactionsService: TransactionsService,
  ) {}

  async createInstallmentPlan(
    createDto: CreateInstallmentPlanDto,
    userId: string,
  ): Promise<InstallmentPlan> {
    try {
      // Get order details
      const order = await this.orderModel
        .findById(createDto.order)
        .populate('items.product')
        .exec();

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Verify order belongs to user
      if (order.customer.toString() !== userId) {
        throw new BadRequestException('Order does not belong to this user');
      }

      // Get product details
      const product = await this.productModel
        .findById(createDto.product)
        .exec();
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Validate installment eligibility
      const sizeConfig = product.sizes?.find(
        (s) => s.size === createDto.productSize,
      );
      const installmentConfig = sizeConfig?.installmentConfig?.enabled
        ? sizeConfig.installmentConfig
        : product.installmentConfig;

      if (!installmentConfig?.enabled) {
        throw new BadRequestException(
          `Product ${product.name} does not support installment payments`,
        );
      }

      if (createDto.totalAmount < installmentConfig.minimumAmount) {
        throw new BadRequestException(
          `Order total must be at least ${installmentConfig.minimumAmount} for installment payments`,
        );
      }

      if (
        !installmentConfig.availableTerms.includes(
          createDto.numberOfInstallments,
        )
      ) {
        throw new BadRequestException(
          `${createDto.numberOfInstallments} installments not available for this product`,
        );
      }

      // Calculate installment details
      const remainingAmount = createDto.totalAmount - createDto.downPayment;
      const annualInterestRate = createDto.interestRate;
      const monthlyInterestRate = annualInterestRate / 12 / 100;

      // Calculate installment amount with interest
      let installmentAmount: number;
      let totalInterest: number;

      if (monthlyInterestRate > 0) {
        // Calculate using compound interest formula
        const factor = Math.pow(
          1 + monthlyInterestRate,
          createDto.numberOfInstallments,
        );
        installmentAmount =
          (remainingAmount * monthlyInterestRate * factor) / (factor - 1);
        totalInterest =
          installmentAmount * createDto.numberOfInstallments - remainingAmount;
      } else {
        // No interest
        installmentAmount = remainingAmount / createDto.numberOfInstallments;
        totalInterest = 0;
      }

      // Calculate end date
      const startDate = new Date(createDto.startDate);
      const endDate = this.calculateEndDate(
        startDate,
        createDto.numberOfInstallments,
        createDto.paymentFrequency,
      );

      // Generate plan number
      const planNumber = this.generatePlanNumber();

      // Create installment plan
      const installmentPlan = new this.installmentPlanModel({
        planNumber,
        customer: new Types.ObjectId(createDto.customer),
        order: new Types.ObjectId(createDto.order),
        product: new Types.ObjectId(createDto.product),
        productSize: createDto.productSize,
        totalAmount: createDto.totalAmount,
        downPayment: createDto.downPayment,
        remainingAmount,
        numberOfInstallments: createDto.numberOfInstallments,
        installmentAmount,
        interestRate: annualInterestRate,
        paymentFrequency: createDto.paymentFrequency,
        paymentMethod: createDto.paymentMethod,
        startDate,
        endDate,
        status: InstallmentStatus.ACTIVE,
        cardToken: createDto.cardToken,
        paymentMethodDetails: createDto.paymentMethodDetails,
        notes: createDto.notes,
        paidInstallments: 0,
        totalPaid: createDto.downPayment, // Down payment is considered paid
      });

      const savedPlan = await installmentPlan.save();

      // Create installment payment schedule
      await this.createPaymentSchedule(savedPlan);

      // Send confirmation email
      try {
        const user = await this.usersService.findById(userId);
        await this.emailService.sendInstallmentPlanCreated(
          savedPlan,
          user,
          order,
        );
      } catch (emailError) {
        console.error(
          'Failed to send installment plan creation email:',
          emailError,
        );
      }

      // Send notification
      try {
        await this.notificationsService.createNotification({
          user: userId,
          title: 'Installment Plan Created',
          message: `Your installment plan #${planNumber} has been created successfully.`,
          type: 'installment',
          reference: savedPlan._id.toString(),
        });
      } catch (notificationError) {
        console.error(
          'Failed to send installment plan notification:',
          notificationError,
        );
      }

      // Log audit
      try {
        await this.auditService.createAuditLog({
          action: 'CREATE',
          userId,
          module: 'INSTALLMENTS',
          description: `Installment plan created: #${planNumber}`,
        });
      } catch (auditError) {
        console.error('Failed to log installment plan audit:', auditError);
      }

      return savedPlan;
    } catch (error) {
      console.error('Error creating installment plan:', error);
      throw error;
    }
  }

  async processInstallmentPayment(
    processDto: ProcessInstallmentPaymentDto,
    userId: string,
  ): Promise<InstallmentPlan> {
    try {
      const plan = await this.installmentPlanModel
        .findById(processDto.planId)
        .exec();

      if (!plan) {
        throw new NotFoundException('Installment plan not found');
      }

      // Verify plan belongs to user
      if (plan.customer.toString() !== userId) {
        throw new BadRequestException(
          'Installment plan does not belong to this user',
        );
      }

      // Find the specific installment payment
      const payment = await this.installmentPaymentModel
        .findOne({
          installmentPlan: plan._id,
          installmentNumber: processDto.installmentNumber,
        })
        .exec();

      if (!payment) {
        throw new NotFoundException('Installment payment not found');
      }

      if (payment.status === PaymentStatus.PAID) {
        throw new BadRequestException('Installment payment already paid');
      }

      // Update payment status
      payment.status = PaymentStatus.PAID;
      payment.paidDate = new Date();
      payment.transaction = new Types.ObjectId(processDto.transactionId);
      // payment.transaction = new Types.ObjectId(processDto.transactionId) as any
      payment.paymentMethod = processDto.paymentMethod;
      payment.paymentReference = processDto.paymentReference;
      payment.paymentDetails = processDto.paymentDetails || {};

      await payment.save();

      // Update plan totals
      plan.paidInstallments += 1;
      plan.totalPaid += payment.amount;

      // Check if plan is completed
      if (plan.paidInstallments >= plan.numberOfInstallments) {
        plan.status = InstallmentStatus.COMPLETED;
        plan.completedAt = new Date();
      }

      const updatedPlan = await plan.save();

      // Send confirmation email
      try {
        const user = await this.usersService.findById(userId);
        await this.emailService.sendInstallmentPaymentConfirmation(
          updatedPlan,
          payment,
          user,
        );
      } catch (emailError) {
        console.error(
          'Failed to send installment payment confirmation email:',
          emailError,
        );
      }

      // Send notification
      try {
        await this.notificationsService.createNotification({
          user: userId,
          title: 'Installment Payment Processed',
          message: `Your installment payment #${processDto.installmentNumber} has been processed successfully.`,
          type: 'installment',
          reference: updatedPlan._id.toString(),
        });
      } catch (notificationError) {
        console.error(
          'Failed to send installment payment notification:',
          notificationError,
        );
      }

      // Log audit
      try {
        await this.auditService.createAuditLog({
          action: 'PAYMENT',
          userId,
          module: 'INSTALLMENTS',
          description: `Installment payment processed: Plan #${plan.planNumber}, Payment #${processDto.installmentNumber}`,
        });
      } catch (auditError) {
        console.error('Failed to log installment payment audit:', auditError);
      }

      return updatedPlan;
    } catch (error) {
      console.error('Error processing installment payment:', error);
      throw error;
    }
  }

  async getInstallmentPlan(
    planId: string,
    userId: string,
  ): Promise<InstallmentPlan> {
    try {
      const plan = await this.installmentPlanModel
        .findById(planId)
        .populate('customer', 'firstName lastName email')
        .populate('order', 'orderNumber total items')
        .populate('product', 'name images')
        .exec();

      if (!plan) {
        throw new NotFoundException('Installment plan not found');
      }

      // Verify plan belongs to user (unless admin)
      // if (plan.customer._id.toString() !== userId) {
      //   throw new BadRequestException("Installment plan does not belong to this user")
      // }

      if (plan.customer.toString() !== userId) {
        throw new BadRequestException(
          'Installment plan does not belong to this user',
        );
      }

      return plan;
    } catch (error) {
      console.error('Error fetching installment plan:', error);
      throw error;
    }
  }

  private async createPaymentSchedule(plan: InstallmentPlan): Promise<void> {
    const payments = [];
    const startDate = new Date(plan.startDate);

    for (let i = 1; i <= plan.numberOfInstallments; i++) {
      const dueDate = this.calculatePaymentDueDate(
        startDate,
        i,
        plan.paymentFrequency,
      );
      const paymentNumber = this.generatePaymentNumber(plan.planNumber, i);

      const payment = new this.installmentPaymentModel({
        paymentNumber,
        installmentPlan: plan._id,
        customer: plan.customer,
        installmentNumber: i,
        amount: plan.installmentAmount,
        dueDate,
        status: PaymentStatus.PENDING,
      });

      const savedPayment = await payment.save();
      payments.push(savedPayment._id);
    }

    plan.payments = payments;
    await plan.save();
  }

  private calculateEndDate(
    startDate: Date,
    installments: number,
    frequency: PaymentFrequency,
  ): Date {
    const endDate = new Date(startDate);

    switch (frequency) {
      case PaymentFrequency.WEEKLY:
        endDate.setDate(startDate.getDate() + installments * 7);
        break;
      case PaymentFrequency.BIWEEKLY:
        endDate.setDate(startDate.getDate() + installments * 14);
        break;
      case PaymentFrequency.MONTHLY:
        endDate.setMonth(startDate.getMonth() + installments);
        break;
    }

    return endDate;
  }

  private calculatePaymentDueDate(
    startDate: Date,
    installmentNumber: number,
    frequency: PaymentFrequency,
  ): Date {
    const dueDate = new Date(startDate);

    switch (frequency) {
      case PaymentFrequency.WEEKLY:
        dueDate.setDate(startDate.getDate() + (installmentNumber - 1) * 7);
        break;
      case PaymentFrequency.BIWEEKLY:
        dueDate.setDate(startDate.getDate() + (installmentNumber - 1) * 14);
        break;
      case PaymentFrequency.MONTHLY:
        dueDate.setMonth(startDate.getMonth() + (installmentNumber - 1));
        break;
    }

    return dueDate;
  }

  // Cron job to check for overdue payments and send reminders
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkOverduePayments(): Promise<void> {
    try {
      console.log('Checking for overdue installment payments...');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find overdue payments
      const overduePayments = await this.installmentPaymentModel
        .find({
          status: PaymentStatus.PENDING,
          dueDate: { $lt: today },
        })
        .populate('customer', 'firstName lastName email')
        .populate('installmentPlan', 'planNumber')
        .exec();

      for (const payment of overduePayments) {
        // Mark as overdue
        payment.status = PaymentStatus.OVERDUE;
        await payment.save();

        // Send reminder email if not sent recently
        const daysSinceLastReminder = payment.lastReminderSent
          ? Math.floor(
              (today.getTime() - payment.lastReminderSent.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 999;

        if (daysSinceLastReminder >= 7) {
          // Send reminder weekly
          await this.sendPaymentReminder(payment);
          payment.lastReminderSent = new Date();
          payment.remindersSent += 1;
          await payment.save();
        }
      }

      console.log('Overdue payment check completed');
    } catch (error) {
      console.error('Error checking overdue payments:', error);
    }
  }

  // Cron job to send upcoming payment reminders
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendUpcomingPaymentReminders(): Promise<void> {
    try {
      console.log('Sending upcoming payment reminders...');

      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + 3); // 3 days before due date
      reminderDate.setHours(23, 59, 59, 999);

      const upcomingPayments = await this.installmentPaymentModel
        .find({
          status: PaymentStatus.PENDING,
          dueDate: { $lte: reminderDate, $gt: new Date() },
        })
        .populate('customer', 'firstName lastName email')
        .populate('installmentPlan', 'planNumber')
        .exec();

      for (const payment of upcomingPayments) {
        // Check if reminder already sent for this payment
        const daysSinceLastReminder = payment.lastReminderSent
          ? Math.floor(
              (new Date().getTime() - payment.lastReminderSent.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 999;

        if (daysSinceLastReminder >= 3) {
          // Don't spam reminders
          await this.sendUpcomingPaymentReminder(payment);
          payment.lastReminderSent = new Date();
          payment.remindersSent += 1;
          await payment.save();
        }
      }

      console.log('Upcoming payment reminders sent');
    } catch (error) {
      console.error('Error sending upcoming payment reminders:', error);
    }
  }

  private async sendPaymentReminder(
    payment: InstallmentPayment,
  ): Promise<void> {
    try {
      const customer = payment.customer as any;
      const plan = payment.installmentPlan as any;
      const daysOverdue = Math.floor(
        (new Date().getTime() - payment.dueDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      await this.emailService.sendInstallmentPaymentReminder(
        plan,
        payment,
        customer,
        daysOverdue,
      );

      await this.notificationsService.createNotification({
        user: customer._id.toString(),
        title: 'Overdue Payment Reminder',
        message: `Your installment payment #${payment.installmentNumber} is ${daysOverdue} days overdue.`,
        type: 'installment',
        reference: plan._id.toString(),
      });
    } catch (error) {
      console.error('Error sending payment reminder:', error);
    }
  }

  private async sendUpcomingPaymentReminder(
    payment: InstallmentPayment,
  ): Promise<void> {
    try {
      const customer = payment.customer as any;
      const plan = payment.installmentPlan as any;
      const daysUntilDue = Math.ceil(
        (payment.dueDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );

      await this.emailService.sendUpcomingInstallmentReminder(
        plan,
        payment,
        customer,
        daysUntilDue,
      );

      await this.notificationsService.createNotification({
        user: customer._id.toString(),
        title: 'Upcoming Payment Reminder',
        message: `Your installment payment #${payment.installmentNumber} is due in ${daysUntilDue} days.`,
        type: 'installment',
        reference: plan._id.toString(),
      });
    } catch (error) {
      console.error('Error sending upcoming payment reminder:', error);
    }
  }

  async getUserInstallmentPlans(
    userId: string,
    options: { status?: InstallmentStatus; page: number; limit: number },
  ): Promise<{ data: any[]; meta: any }> {
    try {
      const { status, page, limit } = options;
      const skip = (page - 1) * limit;

      const query: any = { customer: new Types.ObjectId(userId) };
      if (status) {
        query.status = status;
      }

      const [plans, total] = await Promise.all([
        this.installmentPlanModel
          .find(query)
          .populate('order', 'orderNumber total')
          .populate('customer', 'firstName lastName email')
          .populate('product', 'name images')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.installmentPlanModel.countDocuments(query).exec(),
      ]);

      return {
        data: plans,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching user installment plans:', error);
      throw error;
    }
  }

  async getAllInstallmentPlans(options: {
    status?: InstallmentStatus;
    customerId?: string;
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: any[]; meta: any }> {
    try {
      const { status, customerId, page, limit, search } = options;
      const skip = (page - 1) * limit;

      const query: any = {};

      if (status) {
        query.status = status;
      }

      if (customerId) {
        query.customer = new Types.ObjectId(customerId);
      }

      if (search) {
        query.$or = [{ planNumber: { $regex: search, $options: 'i' } }];
      }

      const [plans, total] = await Promise.all([
        this.installmentPlanModel
          .find(query)
          .populate('order', 'orderNumber total')
          .populate('customer', 'firstName lastName email')
          .populate('product', 'name images')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.installmentPlanModel.countDocuments(query).exec(),
      ]);

      return {
        data: plans,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching all installment plans:', error);
      throw error;
    }
  }

  async getUpcomingPayments(userId: string, days = 30): Promise<any[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const payments = await this.installmentPaymentModel
        .find({
          customer: new Types.ObjectId(userId),
          status: PaymentStatus.PENDING,
          dueDate: { $lte: futureDate, $gt: new Date() },
        })
        .populate('installmentPlan', 'planNumber')
        .sort({ dueDate: 1 })
        .exec();

      return payments.map((payment) => ({
        planId: (payment.installmentPlan as any)._id,
        planNumber: (payment.installmentPlan as any).planNumber,
        installmentNumber: payment.installmentNumber,
        amount: payment.amount,
        dueDate: payment.dueDate,
        daysUntilDue: Math.ceil(
          (payment.dueDate.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      }));
    } catch (error) {
      console.error('Error fetching upcoming payments:', error);
      throw error;
    }
  }

  async getOverduePayments(userId: string): Promise<any[]> {
    try {
      const today = new Date();

      const payments = await this.installmentPaymentModel
        .find({
          customer: new Types.ObjectId(userId),
          status: PaymentStatus.OVERDUE,
        })
        .populate('installmentPlan', 'planNumber')
        .sort({ dueDate: 1 })
        .exec();

      return payments.map((payment) => ({
        planId: (payment.installmentPlan as any)._id,
        planNumber: (payment.installmentPlan as any).planNumber,
        installmentNumber: payment.installmentNumber,
        amount: payment.amount,
        dueDate: payment.dueDate,
        daysOverdue: Math.ceil(
          (today.getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24),
        ),
        lateFee: payment.lateFee,
      }));
    } catch (error) {
      console.error('Error fetching overdue payments:', error);
      throw error;
    }
  }

  async updateInstallmentPlan(
    id: string,
    updateData: UpdateInstallmentPlanDto,
    userId: string,
  ): Promise<any> {
    try {
      const plan = await this.installmentPlanModel.findById(id).exec();

      if (!plan) {
        throw new NotFoundException('Installment plan not found');
      }

      // Update the plan
      Object.assign(plan, updateData);
      const updatedPlan = await plan.save();

      // Log audit
      await this.auditService.createAuditLog({
        action: 'UPDATE',
        userId,
        module: 'INSTALLMENTS',
        description: `Installment plan updated: #${plan.planNumber}`,
        changes: JSON.stringify(updateData),
      });

      return updatedPlan;
    } catch (error) {
      console.error('Error updating installment plan:', error);
      throw error;
    }
  }

  async cancelInstallmentPlan(
    id: string,
    reason: string,
    userId: string,
  ): Promise<any> {
    try {
      const plan = await this.installmentPlanModel.findById(id).exec();

      if (!plan) {
        throw new NotFoundException('Installment plan not found');
      }

      plan.status = InstallmentStatus.CANCELLED;
      plan.cancelledAt = new Date();
      plan.notes = `${plan.notes || ''}\nCancelled: ${reason}`;

      const cancelledPlan = await plan.save();

      // Log audit
      await this.auditService.createAuditLog({
        action: 'CANCEL',
        userId,
        module: 'INSTALLMENTS',
        description: `Installment plan cancelled: #${plan.planNumber}`,
        changes: JSON.stringify({ reason }),
      });

      return cancelledPlan;
    } catch (error) {
      console.error('Error cancelling installment plan:', error);
      throw error;
    }
  }

  private generatePlanNumber(): string {
    const prefix = 'INST';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  private generatePaymentNumber(
    planNumber: string,
    installmentNumber: number,
  ): string {
    return `${planNumber}-P${installmentNumber.toString().padStart(2, '0')}`;
  }

  async getInstallmentAnalytics(options: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    try {
      const { startDate, endDate } = options;
      const matchStage: any = {};

      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = startDate;
        if (endDate) matchStage.createdAt.$lte = endDate;
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
        this.installmentPlanModel
          .countDocuments({ ...matchStage, status: InstallmentStatus.ACTIVE })
          .exec(),
        this.installmentPlanModel
          .countDocuments({
            ...matchStage,
            status: InstallmentStatus.COMPLETED,
          })
          .exec(),
        this.installmentPlanModel
          .countDocuments({
            ...matchStage,
            status: InstallmentStatus.DEFAULTED,
          })
          .exec(),
        this.installmentPlanModel
          .aggregate([
            { $match: matchStage },
            { $group: { _id: null, total: { $sum: '$totalPayable' } } },
          ])
          .exec(),
        this.installmentPlanModel
          .aggregate([
            { $match: matchStage },
            { $group: { _id: null, total: { $sum: '$paidAmount' } } },
          ])
          .exec(),
        this.installmentPlanModel
          .aggregate([
            { $match: matchStage },
            { $group: { _id: null, total: { $sum: '$overdueAmount' } } },
          ])
          .exec(),
        this.installmentPlanModel
          .aggregate([
            { $match: matchStage },
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                },
                count: { $sum: 1 },
                totalAmount: { $sum: '$totalPayable' },
                collectedAmount: { $sum: '$paidAmount' },
              },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
          ])
          .exec(),
      ]);

      return {
        summary: {
          totalPlans,
          activePlans,
          completedPlans,
          defaultedPlans,
          totalAmount: totalAmount[0]?.total || 0,
          collectedAmount: collectedAmount[0]?.total || 0,
          overdueAmount: overdueAmount[0]?.total || 0,
          collectionRate: totalAmount[0]?.total
            ? ((collectedAmount[0]?.total || 0) / totalAmount[0].total) * 100
            : 0,
        },
        monthlyTrends,
      };
    } catch (error) {
      console.error('Error fetching installment analytics:', error);
      throw error;
    }
  }

  async getCollectionReport(options: {
    startDate?: Date;
    endDate?: Date;
    groupBy: 'day' | 'week' | 'month';
  }): Promise<any> {
    try {
      const { startDate, endDate, groupBy } = options;
      const matchStage: any = {};

      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = startDate;
        if (endDate) matchStage.createdAt.$lte = endDate;
      }

      let groupByStage: any;
      switch (groupBy) {
        case 'day':
          groupByStage = {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          };
          break;
        case 'week':
          groupByStage = {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' },
          };
          break;
        case 'month':
        default:
          groupByStage = {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          };
          break;
      }

      const collectionData = await this.installmentPlanModel
        .aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: groupByStage,
              totalPlans: { $sum: 1 },
              totalAmount: { $sum: '$totalPayable' },
              collectedAmount: { $sum: '$paidAmount' },
              overdueAmount: { $sum: '$overdueAmount' },
              activePlans: {
                $sum: {
                  $cond: [{ $eq: ['$status', InstallmentStatus.ACTIVE] }, 1, 0],
                },
              },
              completedPlans: {
                $sum: {
                  $cond: [
                    { $eq: ['$status', InstallmentStatus.COMPLETED] },
                    1,
                    0,
                  ],
                },
              },
              defaultedPlans: {
                $sum: {
                  $cond: [
                    { $eq: ['$status', InstallmentStatus.DEFAULTED] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
          {
            $sort: {
              '_id.year': 1,
              '_id.month': 1,
              '_id.day': 1,
              '_id.week': 1,
            },
          },
        ])
        .exec();

      return {
        groupBy,
        data: collectionData.map((item) => ({
          period: item._id,
          totalPlans: item.totalPlans,
          totalAmount: item.totalAmount,
          collectedAmount: item.collectedAmount,
          overdueAmount: item.overdueAmount,
          collectionRate:
            item.totalAmount > 0
              ? (item.collectedAmount / item.totalAmount) * 100
              : 0,
          activePlans: item.activePlans,
          completedPlans: item.completedPlans,
          defaultedPlans: item.defaultedPlans,
        })),
      };
    } catch (error) {
      console.error('Error generating collection report:', error);
      throw error;
    }
  }

  async getDefaultedPlans(options: {
    page: number;
    limit: number;
  }): Promise<{ data: any[]; meta: any }> {
    try {
      const { page, limit } = options;
      const skip = (page - 1) * limit;

      const [plans, total] = await Promise.all([
        this.installmentPlanModel
          .find({ status: InstallmentStatus.DEFAULTED })
          .populate('customer', 'firstName lastName email phone')
          .populate('order', 'orderNumber total')
          .sort({ defaultedAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.installmentPlanModel
          .countDocuments({ status: InstallmentStatus.DEFAULTED })
          .exec(),
      ]);

      return {
        data: plans,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching defaulted plans:', error);
      throw error;
    }
  }

   // NEW METHOD 1: Restructure Installment Plan
   async restructureInstallmentPlan(
    planId: string,
    restructureData: { newTerms: number; newInterestRate?: number; reason: string },
    userId: string,
  ): Promise<InstallmentPlan> {
    try {
      const plan = await this.installmentPlanModel.findById(planId)

      if (!plan) {
        throw new NotFoundException("Installment plan not found")
      }

      if (plan.customer.toString() !== userId) {
        throw new ForbiddenException("Installment plan does not belong to this user")
      }

      if (plan.status !== InstallmentStatus.ACTIVE) {
        throw new BadRequestException("Can only restructure active installment plans")
      }

      // Calculate remaining amount (total payable minus what's already paid)
      const remainingAmount = plan.totalPayable - plan.paidAmount
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
      plan.remainingAmount = newInstallmentAmount * restructureData.newTerms

      // Update notes
      plan.notes = `${plan.notes || ""}\nRestructured on ${new Date().toISOString()}: ${restructureData.reason}`

      // Cancel all pending payments
      await this.installmentPaymentModel.updateMany(
        { installmentPlan: planId, status: PaymentStatus.PENDING },
        { status: PaymentStatus.CANCELLED }
      )

      // Create new payment schedule
      await this.createNewPaymentSchedule(plan, restructureData.newTerms)

      const restructuredPlan = await plan.save()

      // Send notification
      await this.notificationsService.createNotification({
        user: userId,
        title: "Installment Plan Restructured",
        message: `Your installment plan ${plan.planNumber} has been restructured with new terms.`,
        type: "installment",
        reference: planId,
      })

      // Log audit
      await this.auditService.createAuditLog({
        action: "RESTRUCTURE_INSTALLMENT_PLAN",
        userId,
        module: "INSTALLMENTS",
        description: `Restructured installment plan ${plan.planNumber}`,
        changes: JSON.stringify(restructureData),
      })

      return restructuredPlan
    } catch (error) {
      console.error("Error restructuring installment plan:", error)
      throw error
    }
  }

  // NEW METHOD 2: Send Manual Reminders
  async sendManualReminders(reminderData: {
    planIds?: string[]
    type: "upcoming" | "overdue"
    userId: string
  }): Promise<{ sent: number; failed: number; details: any[] }> {
    try {
      const results = { sent: 0, failed: 0, details: [] }
      let payments: InstallmentPayment[]

      if (reminderData.planIds && reminderData.planIds.length > 0) {
        // Send reminders for specific plans
        const filter: any = {
          installmentPlan: { $in: reminderData.planIds.map(id => new Types.ObjectId(id)) }
        }

        if (reminderData.type === "overdue") {
          filter.$or = [
            { status: PaymentStatus.OVERDUE },
            { status: PaymentStatus.PENDING, dueDate: { $lt: new Date() } }
          ]
        } else if (reminderData.type === "upcoming") {
          const reminderDate = new Date()
          reminderDate.setDate(reminderDate.getDate() + 3) // 3 days ahead
          filter.status = PaymentStatus.PENDING
          filter.dueDate = { $lte: reminderDate, $gt: new Date() }
        }

        payments = await this.installmentPaymentModel
          .find(filter)
          .populate("customer", "firstName lastName email")
          .populate("installmentPlan", "planNumber")
      } else {
        // Send reminders for all applicable payments for the user
        const filter: any = { customer: new Types.ObjectId(reminderData.userId) }

        if (reminderData.type === "overdue") {
          filter.$or = [
            { status: PaymentStatus.OVERDUE },
            { status: PaymentStatus.PENDING, dueDate: { $lt: new Date() } }
          ]
        } else if (reminderData.type === "upcoming") {
          const reminderDate = new Date()
          reminderDate.setDate(reminderDate.getDate() + 3)
          filter.status = PaymentStatus.PENDING
          filter.dueDate = { $lte: reminderDate, $gt: new Date() }
        }

        payments = await this.installmentPaymentModel
          .find(filter)
          .populate("customer", "firstName lastName email")
          .populate("installmentPlan", "planNumber")
      }

      for (const payment of payments) {
        try {
          const customer = payment.customer as any
          const plan = payment.installmentPlan as any

          // Check if reminder was sent recently to avoid spam
          const daysSinceLastReminder = payment.lastReminderSent
            ? Math.floor((new Date().getTime() - payment.lastReminderSent.getTime()) / (1000 * 60 * 60 * 24))
            : 999

          if (daysSinceLastReminder >= 1) { // Allow daily reminders for manual sends
            if (reminderData.type === "overdue") {
              const daysOverdue = Math.floor(
                (new Date().getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24)
              )
              await this.emailService.sendInstallmentPaymentReminder(plan, payment, customer, daysOverdue)
            } else {
              const daysUntilDue = Math.ceil(
                (payment.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              )
              await this.emailService.sendUpcomingInstallmentReminder(plan, payment, customer, daysUntilDue)
            }

            // Update reminder tracking
            payment.lastReminderSent = new Date()
            payment.remindersSent += 1
            await payment.save()

            results.sent++
            results.details.push({
              paymentId: payment._id,
              paymentNumber: payment.paymentNumber,
              planNumber: plan.planNumber,
              customerEmail: customer.email,
              type: reminderData.type,
            })
          } else {
            results.details.push({
              paymentId: payment._id,
              paymentNumber: payment.paymentNumber,
              planNumber: plan.planNumber,
              customerEmail: customer.email,
              skipped: "Reminder sent recently",
            })
          }
        } catch (error) {
          results.failed++
          results.details.push({
            paymentId: payment._id,
            paymentNumber: payment.paymentNumber,
            error: error.message,
          })
        }
      }

      // Log audit
      await this.auditService.createAuditLog({
        action: "SEND_MANUAL_REMINDERS",
        userId: reminderData.userId,
        module: "INSTALLMENTS",
        description: `Sent ${results.sent} manual ${reminderData.type} reminders`,
      })

      return results
    } catch (error) {
      console.error("Error sending manual reminders:", error)
      throw error
    }
  }

  // NEW METHOD 3: Get Upcoming Payments for Dashboard
  async getUpcomingPaymentsForDashboard(days: number = 7): Promise<any[]> {
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)

      const upcomingPayments = await this.installmentPaymentModel
        .find({
          status: PaymentStatus.PENDING,
          dueDate: { $lte: futureDate, $gt: new Date() }
        })
        .populate("customer", "firstName lastName email")
        .populate("installmentPlan", "planNumber")
        .sort({ dueDate: 1 })
        .limit(10) // Limit to top 10 for dashboard
        .exec()

      return upcomingPayments.map(payment => {
        const customer = payment.customer as any
        const plan = payment.installmentPlan as any
        
        return {
          paymentId: payment._id,
          paymentNumber: payment.paymentNumber,
          planNumber: plan.planNumber,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerEmail: customer.email,
          amount: payment.amount,
          dueDate: payment.dueDate,
          installmentNumber: payment.installmentNumber,
          daysUntilDue: Math.ceil((payment.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        }
      })
    } catch (error) {
      console.error("Error fetching upcoming payments for dashboard:", error)
      throw error
    }
  }

  // Helper method to create new payment schedule after restructuring
  private async createNewPaymentSchedule(plan: InstallmentPlan, newTerms: number): Promise<void> {
    const startDate = new Date() // Start from today for restructured payments
    const payments = []

    for (let i = 1; i <= newTerms; i++) {
      const dueDate = new Date(startDate)
      
      // Calculate due date based on payment frequency
      switch (plan.paymentFrequency) {
        case "monthly":
          dueDate.setMonth(dueDate.getMonth() + i)
          break
        case "weekly":
          dueDate.setDate(dueDate.getDate() + (i * 7))
          break
        case "biweekly":
          dueDate.setDate(dueDate.getDate() + (i * 14))
          break
        default:
          dueDate.setMonth(dueDate.getMonth() + i)
      }

      const paymentNumber = `${plan.planNumber}-R${i.toString().padStart(2, "0")}` // R for restructured

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

    // Update plan with new payment references
    plan.payments = [...plan.payments.filter(p => p.toString() !== ""), ...payments]
  }

  private async createInstallmentPayments(plan: InstallmentPlan): Promise<void> {
    const payments: any[] = []
    const startDate = new Date(plan.startDate)

    for (let i = 1; i <= plan.numberOfInstallments; i++) {
      const dueDate = new Date(startDate)
      
      // Calculate due date based on payment frequency
      switch (plan.paymentFrequency) {
        case "monthly":
          dueDate.setMonth(dueDate.getMonth() + i)
          break
        case "weekly":
          dueDate.setDate(dueDate.getDate() + (i * 7))
          break
        case "biweekly":
          dueDate.setDate(dueDate.getDate() + (i * 14))
          break
        default:
          dueDate.setMonth(dueDate.getMonth() + i)
      }

      const paymentNumber = `${plan.planNumber}-${i.toString().padStart(2, "0")}`

      payments.push({
        paymentNumber,
        installmentPlan: plan._id,
        customer: plan.customer,
        installmentNumber: i,
        amount: plan.installmentAmount,
        dueDate,
        status: PaymentStatus.PENDING,
      })
    }

    await this.installmentPaymentModel.insertMany(payments)
  }

    // NEW METHOD 4: Get Installment Dashboard (Admin)
    async getInstallmentDashboard(): Promise<any> {
      try {
        const today = new Date()
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        const startOfYear = new Date(today.getFullYear(), 0, 1)
  
        // Execute all dashboard queries in parallel for better performance
        const [
          // Plan Statistics
          totalPlans,
          activePlans,
          completedPlans,
          cancelledPlans,
          defaultedPlans,
          monthlyNewPlans,
          weeklyNewPlans,
          
          // Financial Metrics
          totalAmountResult,
          totalCollectedResult,
          totalOverdueResult,
          monthlyCollectedResult,
          
          // Payment Statistics
          totalPayments,
          paidPayments,
          pendingPayments,
          overduePayments,
          
          // Recent Activity
          recentPlans,
          recentPayments,
          upcomingPayments,
          
          // Monthly Trends
          monthlyTrends,
          
          // Collection Rate by Status
          plansByStatus,
          paymentsByStatus,
          
          // Top Customers
          topCustomers,
          
          // Overdue Analysis
          overdueAnalysis,
          
          // Performance Metrics
          averageInstallmentAmount,
          averagePlanDuration,
          
        ] = await Promise.all([
          // Plan Statistics
          this.installmentPlanModel.countDocuments().exec(),
          this.installmentPlanModel.countDocuments({ status: InstallmentStatus.ACTIVE }).exec(),
          this.installmentPlanModel.countDocuments({ status: InstallmentStatus.COMPLETED }).exec(),
          this.installmentPlanModel.countDocuments({ status: InstallmentStatus.CANCELLED }).exec(),
          this.installmentPlanModel.countDocuments({ status: InstallmentStatus.DEFAULTED }).exec(),
          this.installmentPlanModel.countDocuments({ createdAt: { $gte: startOfMonth } }).exec(),
          this.installmentPlanModel.countDocuments({ createdAt: { $gte: startOfWeek } }).exec(),
          
          // Financial Metrics
          this.installmentPlanModel.aggregate([
            { $group: { _id: null, total: { $sum: "$totalPayable" } } }
          ]).exec(),
          this.installmentPlanModel.aggregate([
            { $group: { _id: null, total: { $sum: "$paidAmount" } } }
          ]).exec(),
          this.installmentPlanModel.aggregate([
            { $group: { _id: null, total: { $sum: "$overdueAmount" } } }
          ]).exec(),
          this.installmentPlanModel.aggregate([
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$paidAmount" } } }
          ]).exec(),
          
          // Payment Statistics
          this.installmentPaymentModel.countDocuments().exec(),
          this.installmentPaymentModel.countDocuments({ status: PaymentStatus.PAID }).exec(),
          this.installmentPaymentModel.countDocuments({ status: PaymentStatus.PENDING }).exec(),
          this.installmentPaymentModel.countDocuments({ status: PaymentStatus.OVERDUE }).exec(),
          
          // Recent Activity
          this.installmentPlanModel
            .find()
            .populate("customer", "firstName lastName email")
            .populate("order", "orderNumber")
            .sort({ createdAt: -1 })
            .limit(5)
            .exec(),
          this.installmentPaymentModel
            .find({ status: PaymentStatus.PAID })
            .populate("customer", "firstName lastName")
            .populate("installmentPlan", "planNumber")
            .sort({ paidDate: -1 })
            .limit(5)
            .exec(),
          this.getUpcomingPaymentsForDashboard(7),
          
          // Monthly Trends (Last 12 months)
          this.installmentPlanModel.aggregate([
            {
              $match: {
                createdAt: { $gte: new Date(today.getFullYear() - 1, today.getMonth(), 1) }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" }
                },
                plansCreated: { $sum: 1 },
                totalAmount: { $sum: "$totalPayable" },
                collectedAmount: { $sum: "$paidAmount" }
              }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
          ]).exec(),
          
          // Plans by Status Distribution
          this.installmentPlanModel.aggregate([
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalAmount: { $sum: "$totalPayable" },
                collectedAmount: { $sum: "$paidAmount" }
              }
            }
          ]).exec(),
          
          // Payments by Status Distribution
          this.installmentPaymentModel.aggregate([
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalAmount: { $sum: "$amount" }
              }
            }
          ]).exec(),
          
          // Top Customers by Total Amount
          this.installmentPlanModel.aggregate([
            {
              $group: {
                _id: "$customer",
                totalPlans: { $sum: 1 },
                totalAmount: { $sum: "$totalPayable" },
                totalPaid: { $sum: "$paidAmount" }
              }
            },
            { $sort: { totalAmount: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "customer"
              }
            },
            { $unwind: "$customer" }
          ]).exec(),
          
          // Overdue Analysis
          this.installmentPaymentModel.aggregate([
            {
              $match: {
                status: PaymentStatus.OVERDUE
              }
            },
            {
              $group: {
                _id: null,
                totalOverduePayments: { $sum: 1 },
                totalOverdueAmount: { $sum: "$amount" },
                averageOverdueAmount: { $avg: "$amount" }
              }
            }
          ]).exec(),
          
          // Performance Metrics
          this.installmentPlanModel.aggregate([
            {
              $group: {
                _id: null,
                averageInstallmentAmount: { $avg: "$installmentAmount" },
                averageTotalAmount: { $avg: "$totalPayable" }
              }
            }
          ]).exec(),
          
          this.installmentPlanModel.aggregate([
            {
              $group: {
                _id: null,
                averageDuration: { $avg: "$numberOfInstallments" }
              }
            }
          ]).exec(),
        ])
  
        // Calculate derived metrics
        const totalAmount = totalAmountResult[0]?.total || 0
        const totalCollected = totalCollectedResult[0]?.total || 0
        const totalOverdue = totalOverdueResult[0]?.total || 0
        const monthlyCollected = monthlyCollectedResult[0]?.total || 0
        
        const collectionRate = totalAmount > 0 ? (totalCollected / totalAmount) * 100 : 0
        const overdueRate = totalAmount > 0 ? (totalOverdue / totalAmount) * 100 : 0
        const completionRate = totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0
        
        // Growth calculations
        const monthlyGrowthRate = totalPlans > 0 ? (monthlyNewPlans / totalPlans) * 100 : 0
        const weeklyGrowthRate = totalPlans > 0 ? (weeklyNewPlans / totalPlans) * 100 : 0
  
        return {
          summary: {
            totalPlans,
            activePlans,
            completedPlans,
            cancelledPlans,
            defaultedPlans,
            monthlyNewPlans,
            weeklyNewPlans,
            totalAmount,
            totalCollected,
            totalOverdue,
            monthlyCollected,
            collectionRate: Math.round(collectionRate * 100) / 100,
            overdueRate: Math.round(overdueRate * 100) / 100,
            completionRate: Math.round(completionRate * 100) / 100,
            monthlyGrowthRate: Math.round(monthlyGrowthRate * 100) / 100,
            weeklyGrowthRate: Math.round(weeklyGrowthRate * 100) / 100,
          },
          
          paymentSummary: {
            totalPayments,
            paidPayments,
            pendingPayments,
            overduePayments,
            paymentSuccessRate: totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 10000) / 100 : 0,
          },
          
          recentActivity: {
            recentPlans: recentPlans.map(plan => ({
              id: plan._id,
              planNumber: plan.planNumber,
              customerName: `${(plan.customer as any)?.firstName} ${(plan.customer as any)?.lastName}`,
              orderNumber: (plan.order as any)?.orderNumber,
              totalAmount: plan.totalAmount,
              status: plan.status,
              createdAt: plan.createdAt,
            })),
            
            recentPayments: recentPayments.map(payment => ({
              id: payment._id,
              paymentNumber: payment.paymentNumber,
              planNumber: (payment.installmentPlan as any)?.planNumber,
              customerName: `${(payment.customer as any)?.firstName} ${(payment.customer as any)?.lastName}`,
              amount: payment.amount,
              paidDate: payment.paidDate,
            })),
            
            upcomingPayments,
          },
          
          trends: {
            monthly: monthlyTrends.map(trend => ({
              period: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
              plansCreated: trend.plansCreated,
              totalAmount: trend.totalAmount,
              collectedAmount: trend.collectedAmount,
              collectionRate: trend.totalAmount > 0 ? Math.round((trend.collectedAmount / trend.totalAmount) * 10000) / 100 : 0,
            })),
          },
          
          distribution: {
            plansByStatus: plansByStatus.map(item => ({
              status: item._id,
              count: item.count,
              totalAmount: item.totalAmount,
              collectedAmount: item.collectedAmount,
              percentage: totalPlans > 0 ? Math.round((item.count / totalPlans) * 10000) / 100 : 0,
            })),
            
            paymentsByStatus: paymentsByStatus.map(item => ({
              status: item._id,
              count: item.count,
              totalAmount: item.totalAmount,
              percentage: totalPayments > 0 ? Math.round((item.count / totalPayments) * 10000) / 100 : 0,
            })),
          },
          
          topCustomers: topCustomers.map(customer => ({
            customerId: customer._id,
            customerName: `${customer.customer.firstName} ${customer.customer.lastName}`,
            customerEmail: customer.customer.email,
            totalPlans: customer.totalPlans,
            totalAmount: customer.totalAmount,
            totalPaid: customer.totalPaid,
            collectionRate: customer.totalAmount > 0 ? Math.round((customer.totalPaid / customer.totalAmount) * 10000) / 100 : 0,
          })),
          
          overdueAnalysis: overdueAnalysis[0] ? {
            totalOverduePayments: overdueAnalysis[0].totalOverduePayments,
            totalOverdueAmount: overdueAnalysis[0].totalOverdueAmount,
            averageOverdueAmount: Math.round(overdueAnalysis[0].averageOverdueAmount * 100) / 100,
          } : {
            totalOverduePayments: 0,
            totalOverdueAmount: 0,
            averageOverdueAmount: 0,
          },
          
          performanceMetrics: {
            averageInstallmentAmount: averageInstallmentAmount[0] ? Math.round(averageInstallmentAmount[0].averageInstallmentAmount * 100) / 100 : 0,
            averageTotalAmount: averageInstallmentAmount[0] ? Math.round(averageInstallmentAmount[0].averageTotalAmount * 100) / 100 : 0,
            averagePlanDuration: averagePlanDuration[0] ? Math.round(averagePlanDuration[0].averageDuration * 10) / 10 : 0,
          },
          
          generatedAt: new Date().toISOString(),
        }
      } catch (error) {
        console.error("Error fetching installment dashboard:", error)
        throw error
      }
    }
}
