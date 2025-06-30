

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Schema as MongooseSchema, Types } from "mongoose"

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  RETURNED = "returned",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",                 
  FAILED = "failed",
  REFUNDED = "refunded",
  PARTIALLY_PAID = "partially_paid",
}

export enum PaymentType {
  FULL = "full",
  INSTALLMENT = "installment",
}

export class OrderItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Product", required: true })
  product: MongooseSchema.Types.ObjectId

  @Prop({ required: true, min: 1 })
  quantity: number

  @Prop({ required: true, min: 0 })
  price: number

  @Prop()
  size: string

  @Prop()
  color: string

  @Prop({ default: 0, min: 0 })
  discount: number

  @Prop({ required: true, min: 0 })
  total: number
}

export class Address {
  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop({ required: true })
  address: string

  @Prop({ required: true })
  city: string

  @Prop({ required: true })
  state: string

  @Prop({ required: true })
  country: string

  @Prop({ required: true })
  postalCode: string

  @Prop({ required: true })
  phone: string

  @Prop({ required: true })
  email: string
}

export class InstallmentInfo {
  @Prop({ default: false })
  isInstallment: boolean

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "InstallmentPlan" })
  installmentPlan: MongooseSchema.Types.ObjectId

  @Prop()
  numberOfInstallments: number

  @Prop({ min: 0 })
  downPayment: number

  @Prop({ min: 0 })
  installmentAmount: number

  @Prop({ min: 0, max: 100 })
  interestRate: number

  @Prop({ min: 0 })
  totalPayable: number

  @Prop()
  paymentFrequency: string

  @Prop()
  paymentMethod: string
}

export class StatusHistoryEntry {
  @Prop({ required: true, enum: OrderStatus })
  status: OrderStatus

  @Prop({ required: true, default: Date.now })
  date: Date

  @Prop()
  notes: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  userId: MongooseSchema.Types.ObjectId
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v
      return ret
    },
  },
})
export class Order extends Document {
  @Prop({ required: true, unique: true })
  orderNumber: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  customer: MongooseSchema.Types.ObjectId

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[]

  @Prop({ required: true, min: 0 })
  subtotal: number

  @Prop({ required: true, min: 0 })
  tax: number

  @Prop({ required: true, min: 0, default: 2.5 })
  taxRate: number

  @Prop({ required: true, min: 0 })
  shipping: number

  @Prop({ default: 0, min: 0 })
  discount: number

  @Prop({ required: true, min: 0 })
  total: number

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus

  @Prop({ enum: PaymentType, default: PaymentType.FULL })
  paymentType: PaymentType

  @Prop({ type: InstallmentInfo })
  installmentInfo: InstallmentInfo

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Transaction" })
  transaction: MongooseSchema.Types.ObjectId

  @Prop({ type: Address, required: true })
  shippingAddress: Address

  @Prop({ type: Address, required: true })
  billingAddress: Address

  @Prop()
  notes: string

  @Prop({ type: [StatusHistoryEntry], default: [] })
  statusHistory: StatusHistoryEntry[]

  @Prop()
  trackingNumber: string

  @Prop()
  trackingUrl: string

  @Prop()
  estimatedDelivery: Date

  @Prop()
  shippedAt: Date

  @Prop()
  deliveredAt: Date

  @Prop()
  cancelledAt: Date

  @Prop()
  returnedAt: Date

  @Prop()
  refundedAt: Date

  // Payment-related fields
  @Prop({ default: 0, min: 0 })
  paidAmount: number

  @Prop({ default: 0, min: 0 })
  refundedAmount: number

  @Prop()
  paymentMethod: string

  @Prop()
  paymentReference: string

  @Prop({ type: Object })
  paymentDetails: Record<string, any>

  // Shipping-related fields
  @Prop()
  shippingMethod: string

  @Prop({ default: 0, min: 0 })
  shippingCost: number

  @Prop()
  shippingCarrier: string

  // Additional metadata
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>

  @Prop()
  source: string // e.g., 'web', 'mobile', 'admin'

  @Prop()
  currency: string

  @Prop()
  locale: string
}

export const OrderSchema = SchemaFactory.createForClass(Order)

// Virtual for calculating order age in days
OrderSchema.virtual("age").get(function (this: any) {
  return Math.floor((Date.now() - (this.createdAt ? this.createdAt.getTime() : Date.now())) / (1000 * 60 * 60 * 24))
})

// Virtual for calculating remaining balance
OrderSchema.virtual("remainingBalance").get(function (this: any) {
  return Math.max(0, this.total - this.paidAmount)
})

// Virtual for checking if order is fully paid
OrderSchema.virtual("isFullyPaid").get(function (this: any) {
  return this.paidAmount >= this.total
})

// Virtual for checking if order is overdue (for installment orders)
OrderSchema.virtual("isOverdue").get(function (this: any) {
  if (this.paymentType !== PaymentType.INSTALLMENT || !this.installmentInfo?.isInstallment) {
    return false
  }
  
  // This would need to be calculated based on installment payment schedule
  // For now, return false - actual implementation would check against payment due dates
  return false
})

// Method to add status history entry
OrderSchema.methods.addStatusHistory = function(status: OrderStatus, notes?: string, userId?: string) {
  this.statusHistory.push({
    status,
    date: new Date(),
    notes,
    userId: userId ? new Types.ObjectId(userId) : undefined
  })
  
  this.status = status
  
  // Set specific date fields based on status
  switch (status) {
    case OrderStatus.SHIPPED:
      this.shippedAt = new Date()
      break
    case OrderStatus.DELIVERED:
      this.deliveredAt = new Date()
      break
    case OrderStatus.CANCELLED:
      this.cancelledAt = new Date()
      break
    case OrderStatus.RETURNED:
      this.returnedAt = new Date()
      break
    case OrderStatus.REFUNDED:
      this.refundedAt = new Date()
      break
  }
}

// Method to update payment status
OrderSchema.methods.updatePaymentStatus = function(status: PaymentStatus, amount?: number, reference?: string) {
  this.paymentStatus = status
  
  if (amount !== undefined) {
    if (status === PaymentStatus.PAID || status === PaymentStatus.PARTIALLY_PAID) {
      this.paidAmount = Math.min(this.total, this.paidAmount + amount)
    } else if (status === PaymentStatus.REFUNDED) {
      this.refundedAmount = Math.min(this.paidAmount, this.refundedAmount + amount)
    }
  }
  
  if (reference) {
    this.paymentReference = reference
  }
  
  // Auto-update payment status based on amounts
  if (this.paidAmount >= this.total) {
    this.paymentStatus = PaymentStatus.PAID
  } else if (this.paidAmount > 0) {
    this.paymentStatus = PaymentStatus.PARTIALLY_PAID
  }
}

// Method to calculate installment details
OrderSchema.methods.calculateInstallmentDetails = function(
  numberOfInstallments: number,
  downPaymentPercentage: number,
  interestRate: number
) {
  const downPayment = (this.total * downPaymentPercentage) / 100
  const remainingAmount = this.total - downPayment
  const monthlyInterestRate = interestRate / 12 / 100
  
  let installmentAmount: number
  let totalInterest: number
  
  if (monthlyInterestRate > 0) {
    // Calculate using compound interest formula
    const factor = Math.pow(1 + monthlyInterestRate, numberOfInstallments)
    installmentAmount = (remainingAmount * monthlyInterestRate * factor) / (factor - 1)
    totalInterest = installmentAmount * numberOfInstallments - remainingAmount
  } else {
    // No interest
    installmentAmount = remainingAmount / numberOfInstallments
    totalInterest = 0
  }
  
  const totalPayable = downPayment + installmentAmount * numberOfInstallments
  
  return {
    downPayment,
    installmentAmount,
    totalInterest,
    totalPayable,
    remainingAmount
  }
}

// Index for better query performance
OrderSchema.index({ customer: 1, createdAt: -1 })
OrderSchema.index({ orderNumber: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ paymentStatus: 1 })
OrderSchema.index({ paymentType: 1 })
OrderSchema.index({ 'installmentInfo.isInstallment': 1 })
OrderSchema.index({ createdAt: -1 })