// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
// import { Document, Schema as MongooseSchema } from "mongoose"

// export enum InstallmentStatus {
//   ACTIVE = "active",
//   COMPLETED = "completed",
//   PENDING = "pending",
//   PAID = "paid",
//   DEFAULTED = "defaulted",
//   OVERDUE="overdue",
//   CANCELLED = "cancelled",
// }

// export enum PaymentFrequency {
//   WEEKLY = "weekly",
//   BIWEEKLY = "biweekly", 
//   MONTHLY = "monthly",
// }

// export enum PaymentMethod {
//   AUTO_DEDUCTION = "auto_deduction",
//   MANUAL = "manual",
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
// export class InstallmentPlan extends Document {
//   @Prop({ required: true, unique: true })
//   planNumber: string

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
//   customer: MongooseSchema.Types.ObjectId

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Order", required: true })
//   order: MongooseSchema.Types.ObjectId

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Product", required: true })
//   product: MongooseSchema.Types.ObjectId

//   @Prop({ required: true })
//   productSize: string

//   @Prop({ required: true, min: 0 })
//   totalAmount: number

//   @Prop({ required: true, min: 0 })
//   downPayment: number

//   @Prop({ required: true, min: 0 })
//   remainingAmount: number

//   @Prop({ required: true, min: 1 })
//   numberOfInstallments: number

//   @Prop({ required: true, min: 0 })
//   installmentAmount: number

//   @Prop({ required: true, min: 0, max: 100 })
//   interestRate: number

//   @Prop({ required: true, enum: PaymentFrequency })
//   paymentFrequency: PaymentFrequency

//   @Prop({ required: true, enum: PaymentMethod })
//   paymentMethod: PaymentMethod

//   @Prop({ required: true })
//   startDate: Date

//   @Prop({ required: true })
//   endDate: Date

//   @Prop({ required: true, enum: InstallmentStatus, default: InstallmentStatus.ACTIVE })
//   status: InstallmentStatus

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: "InstallmentAgreement" })
//   agreement: MongooseSchema.Types.ObjectId

//   @Prop({ default: 0 })
//   paidInstallments: number

//   @Prop({ default: 0 })
//   totalPaid: number

//   @Prop()
//   cardToken: string // For auto-deduction

//   @Prop({ type: Object })
//   paymentMethodDetails: Record<string, any>

//   @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "InstallmentPayment" }] })
//   payments: MongooseSchema.Types.ObjectId[]

//   @Prop()
//   notes: string

//   @Prop()
//   completedAt: Date

//   @Prop()
//   defaultedAt: Date

//   @Prop()
//   cancelledAt: Date
// }

// export const InstallmentPlanSchema = SchemaFactory.createForClass(InstallmentPlan)

// // Virtual for calculating progress percentage
// InstallmentPlanSchema.virtual("progressPercentage").get(function () {
//   if (this.numberOfInstallments === 0) return 0
//   return Math.round((this.paidInstallments / this.numberOfInstallments) * 100)
// })

// // Virtual for next payment date
// InstallmentPlanSchema.virtual("nextPaymentDate").get(function () {
//   if (this.status !== InstallmentStatus.ACTIVE) return null
  
//   const startDate = new Date(this.startDate)
//   const paidInstallments = this.paidInstallments || 0
  
//   let nextDate = new Date(startDate)
  
//   switch (this.paymentFrequency) {
//     case PaymentFrequency.WEEKLY:
//       nextDate.setDate(startDate.getDate() + (paidInstallments * 7))
//       break
//     case PaymentFrequency.BIWEEKLY:
//       nextDate.setDate(startDate.getDate() + (paidInstallments * 14))
//       break
//     case PaymentFrequency.MONTHLY:
//       nextDate.setMonth(startDate.getMonth() + paidInstallments)
//       break
//   }
  
//   return nextDate
// })

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Schema as MongooseSchema } from "mongoose"

export enum InstallmentStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  PENDING = "pending",
  PAID = "paid",
  DEFAULTED = "defaulted",
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
}

export enum PaymentFrequency {
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly", 
  MONTHLY = "monthly",
}

export enum PaymentMethod {
  AUTO_DEDUCTION = "auto_deduction",
  MANUAL = "manual",
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

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  customer: MongooseSchema.Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Order", required: true })
  order: MongooseSchema.Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Product", required: true })
  product: MongooseSchema.Types.ObjectId

  @Prop({ required: true })
  productSize: string

  @Prop({ required: true, min: 0 })
  totalAmount: number

  @Prop({ required: true, min: 0 })
  downPayment: number

  @Prop({ required: true, min: 0 })
  remainingAmount: number

  @Prop({ required: true, min: 1 })
  numberOfInstallments: number

  @Prop({ required: true, min: 0 })
  installmentAmount: number

  @Prop({ required: true, min: 0, max: 100 })
  interestRate: number

  // Add missing properties
  @Prop({ required: true, min: 0 })
  totalInterest: number

  @Prop({ required: true, min: 0 })
  totalPayable: number

  @Prop({ required: true, enum: PaymentFrequency })
  paymentFrequency: PaymentFrequency

  @Prop({ required: true, enum: PaymentMethod })
  paymentMethod: PaymentMethod

  @Prop({ required: true })
  startDate: Date

  @Prop({ required: true })
  endDate: Date

  @Prop({ required: true, enum: InstallmentStatus, default: InstallmentStatus.ACTIVE })
  status: InstallmentStatus

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "InstallmentAgreement" })
  agreement: MongooseSchema.Types.ObjectId

  @Prop({ default: 0 })
  paidInstallments: number

  @Prop({ default: 0 })
  totalPaid: number

  // Add missing paidAmount property
  @Prop({ default: 0, min: 0 })
  paidAmount: number

  // Add missing overdueAmount property
  @Prop({ default: 0, min: 0 })
  overdueAmount: number

  @Prop()
  cardToken: string // For auto-deduction

  @Prop({ type: Object })
  paymentMethodDetails: Record<string, any>

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "InstallmentPayment" }] })
  payments: MongooseSchema.Types.ObjectId[]

  @Prop()
  notes: string

  @Prop()
  completedAt: Date

  @Prop()
  defaultedAt: Date

  @Prop()
  cancelledAt: Date

    // Timestamps (automatically added by Mongoose when timestamps: true)
    createdAt?: Date
    updatedAt?: Date
}

export const InstallmentPlanSchema = SchemaFactory.createForClass(InstallmentPlan)

// Virtual for calculating progress percentage
InstallmentPlanSchema.virtual("progressPercentage").get(function () {
  if (this.numberOfInstallments === 0) return 0
  return Math.round((this.paidInstallments / this.numberOfInstallments) * 100)
})

// Virtual for next payment date
InstallmentPlanSchema.virtual("nextPaymentDate").get(function () {
  if (this.status !== InstallmentStatus.ACTIVE) return null
  
  const startDate = new Date(this.startDate)
  const paidInstallments = this.paidInstallments || 0
  
  let nextDate = new Date(startDate)
  
  switch (this.paymentFrequency) {
    case PaymentFrequency.WEEKLY:
      nextDate.setDate(startDate.getDate() + (paidInstallments * 7))
      break
    case PaymentFrequency.BIWEEKLY:
      nextDate.setDate(startDate.getDate() + (paidInstallments * 14))
      break
    case PaymentFrequency.MONTHLY:
      nextDate.setMonth(startDate.getMonth() + paidInstallments)
      break
  }
  
  return nextDate
})