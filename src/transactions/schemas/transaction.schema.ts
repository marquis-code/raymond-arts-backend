// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
// import { Document, Schema as MongooseSchema } from "mongoose"
// import { TransactionStatus } from "../enums/transaction-status.enum"
// import { TransactionType } from "../enums/transaction-type.enum"

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
// export class Transaction extends Document {
//   @Prop({ required: true, unique: true })
//   transactionId: string

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
//   user: MongooseSchema.Types.ObjectId

//   @Prop({ required: true, enum: TransactionType })
//   type: TransactionType

//   @Prop({ required: true, min: 0 })
//   amount: number

//   @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.PENDING })
//   status: TransactionStatus

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Order" })
//   order: MongooseSchema.Types.ObjectId

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Invoice" })
//   invoice: MongooseSchema.Types.ObjectId

//   @Prop()
//   paymentMethod: string

//   @Prop()
//   paymentReference: string

//   @Prop()
//   currency: string

//   @Prop({ type: Object })
//   metadata: Record<string, any>

//   @Prop()
//   description: string

//   @Prop()
//   gatewayResponse: string

//   @Prop()
//   feeCharged: number

//   @Prop()
//   completedAt: Date

//   @Prop()
//   failedAt: Date
// }

// export const TransactionSchema = SchemaFactory.createForClass(Transaction)


import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Schema as MongooseSchema } from "mongoose"
import { TransactionStatus } from "../enums/transaction-status.enum"
import { TransactionType } from "../enums/transaction-type.enum"

export enum PaymentContext {
  FULL_PAYMENT = "full_payment",
  DOWN_PAYMENT = "down_payment",
  INSTALLMENT_PAYMENT = "installment_payment",
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
export class Transaction extends Document {
  @Prop({ required: true, unique: true })
  transactionId: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  user: MongooseSchema.Types.ObjectId

  @Prop({ required: true, enum: TransactionType })
  type: TransactionType

  @Prop({ required: true, min: 0 })
  amount: number

  @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Order" })
  order: MongooseSchema.Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Invoice" })
  invoice: MongooseSchema.Types.ObjectId

  // New installment-related fields
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "InstallmentPlan" })
  installmentPlan: MongooseSchema.Types.ObjectId

  @Prop({ enum: PaymentContext, default: PaymentContext.FULL_PAYMENT })
  paymentContext: PaymentContext

  @Prop()
  installmentNumber: number

  @Prop()
  paymentMethod: string

  @Prop()
  paymentReference: string

  @Prop()
  currency: string

  @Prop({ type: Object })
  metadata: Record<string, any>

  @Prop()
  description: string

  @Prop()
  gatewayResponse: string

  @Prop()
  feeCharged: number

  @Prop()
  completedAt: Date

  @Prop()
  failedAt: Date
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction)
