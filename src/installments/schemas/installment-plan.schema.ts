import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"

export enum InstallmentStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  DEFAULTED = "defaulted",
  CANCELLED = "cancelled",
}

export enum InstallmentPaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  OVERDUE = "overdue",
  FAILED = "failed",
}

export class InstallmentPayment {
  @Prop({ required: true })
  installmentNumber: number

  @Prop({ required: true, min: 0 })
  amount: number

  @Prop({ required: true })
  dueDate: Date

  @Prop({ enum: InstallmentPaymentStatus, default: InstallmentPaymentStatus.PENDING })
  status: InstallmentPaymentStatus

  @Prop()
  paidDate: Date

  @Prop({ type: Types.ObjectId, ref: "Transaction" })
  transaction: Types.ObjectId

  @Prop({ default: 0 })
  lateFee: number

  @Prop()
  reminderSentAt: Date

  @Prop({ default: 0 })
  reminderCount: number
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
export class InstallmentPlan extends Document {
  @Prop({ required: true, unique: true })
  planNumber: string

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  customer: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: "Order", required: true })
  order: Types.ObjectId

  @Prop({ required: true, min: 0 })
  totalAmount: number

  @Prop({ required: true, min: 0 })
  downPayment: number

  @Prop({ required: true, min: 0 })
  installmentAmount: number

  @Prop({ required: true, min: 2 })
  numberOfInstallments: number

  @Prop({ required: true, min: 0 })
  interestRate: number

  @Prop({ required: true, min: 0 })
  totalInterest: number

  @Prop({ required: true, min: 0 })
  totalPayable: number

  @Prop({ enum: InstallmentStatus, default: InstallmentStatus.ACTIVE })
  status: InstallmentStatus

  @Prop({ required: true })
  startDate: Date

  @Prop({ required: true })
  endDate: Date

  @Prop({ type: [InstallmentPayment], default: [] })
  payments: InstallmentPayment[]

  @Prop({ default: 0 })
  paidAmount: number

  @Prop({ default: 0 })
  remainingAmount: number

  @Prop({ default: 0 })
  overdueAmount: number

  @Prop()
  completedAt: Date

  @Prop()
  defaultedAt: Date

  @Prop()
  cancelledAt: Date

  @Prop()
  notes: string
}

export const InstallmentPlanSchema = SchemaFactory.createForClass(InstallmentPlan)

// Virtual for calculating completion percentage
InstallmentPlanSchema.virtual("completionPercentage").get(function () {
  if (this.totalPayable === 0) return 0
  return Math.round((this.paidAmount / this.totalPayable) * 100)
})

// Virtual for calculating days overdue
InstallmentPlanSchema.virtual("daysOverdue").get(function () {
  const today = new Date()
  const overdueDays = this.payments
    .filter((payment) => payment.status === InstallmentPaymentStatus.OVERDUE && payment.dueDate < today)
    .reduce((max, payment) => {
      const days = Math.ceil((today.getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      return Math.max(max, days)
    }, 0)

  return overdueDays
})
