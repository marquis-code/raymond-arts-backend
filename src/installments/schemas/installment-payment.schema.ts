
// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
// import { Document, Schema as MongooseSchema, Types } from "mongoose"

// export enum PaymentStatus {
//   PENDING = "pending",
//   PAID = "paid",
//   FAILED = "failed",
//   OVERDUE = "overdue",
//   CANCELLED = "cancelled",
// }

// @Schema({
//   timestamps: true,
//   toJSON: {
//     virtuals: true,
//     transform: (doc, ret) => {
//       delete ret.__v
//       return ret
//     },
//   },
// })
// export class InstallmentPayment extends Document {
//   @Prop({ required: true, unique: true })
//   paymentNumber: string

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: "InstallmentPlan", required: true })
//   installmentPlan: MongooseSchema.Types.ObjectId

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
//   customer: MongooseSchema.Types.ObjectId

//   @Prop({ required: true, min: 1 })
//   installmentNumber: number

//   @Prop({ required: true, min: 0 })
//   amount: number

//   @Prop({ required: true })
//   dueDate: Date

//   @Prop()
//   paidDate: Date

//   @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
//   status: PaymentStatus

//   // @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Transaction" })
//   // transaction: MongooseSchema.Types.ObjectId
//   @Prop({ type: Types.ObjectId, ref: "Transaction" })
//   transaction: Types.ObjectId

//   @Prop()
//   paymentMethod: string

//   @Prop()
//   paymentReference: string

//   @Prop()
//   failureReason: string

//   @Prop({ default: 0 })
//   lateFee: number

//   @Prop({ default: 0 })
//   remindersSent: number

//   @Prop()
//   lastReminderSent: Date

//   @Prop({ type: Object })
//   paymentDetails: Record<string, any>

//   @Prop()
//   notes: string
// }

// export const InstallmentPaymentSchema = SchemaFactory.createForClass(InstallmentPayment)

// // Virtual for days overdue
// InstallmentPaymentSchema.virtual("daysOverdue").get(function () {
//   if (this.status !== PaymentStatus.OVERDUE && this.status !== PaymentStatus.PENDING) {
//     return 0
//   }

//   const today = new Date()
//   const dueDate = new Date(this.dueDate)

//   if (today <= dueDate) {
//     return 0
//   }

//   const diffTime = Math.abs(today.getTime() - dueDate.getTime())
//   return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
// })

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Schema as MongooseSchema, Types } from "mongoose"
import { PaymentStatus } from "../../shared/enums/payment-status.enum"

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
export class InstallmentPayment extends Document {
  @Prop({ required: true, unique: true })
  paymentNumber: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "InstallmentPlan", required: true })
  installmentPlan: MongooseSchema.Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  customer: MongooseSchema.Types.ObjectId

  @Prop({ required: true, min: 1 })
  installmentNumber: number

  @Prop({ required: true, min: 0 })
  amount: number

  @Prop({ required: true })
  dueDate: Date

  @Prop()
  paidDate: Date

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus

  @Prop({ type: Types.ObjectId, ref: "Transaction" })
  transaction: Types.ObjectId

  @Prop()
  paymentMethod: string

  @Prop()
  paymentReference: string

  @Prop()
  failureReason: string

  @Prop({ default: 0 })
  lateFee: number

  @Prop({ default: 0 })
  remindersSent: number

  @Prop()
  lastReminderSent: Date

  @Prop({ type: Object })
  paymentDetails: Record<string, any>

  @Prop()
  notes: string

    // Timestamps (automatically added by Mongoose when timestamps: true)
    createdAt?: Date
    updatedAt?: Date
}

export const InstallmentPaymentSchema = SchemaFactory.createForClass(InstallmentPayment)

// Virtual for days overdue
InstallmentPaymentSchema.virtual("daysOverdue").get(function () {
  if (this.status !== PaymentStatus.OVERDUE && this.status !== PaymentStatus.PENDING) {
    return 0
  }

  const today = new Date()
  const dueDate = new Date(this.dueDate)

  if (today <= dueDate) {
    return 0
  }

  const diffTime = Math.abs(today.getTime() - dueDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})