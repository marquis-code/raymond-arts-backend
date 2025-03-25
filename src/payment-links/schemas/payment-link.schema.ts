import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Schema as MongooseSchema } from "mongoose"
import { PaymentLinkStatus } from "../enums/payment-link-status.enum"

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
export class PaymentLink extends Document {
  @Prop({ required: true, unique: true })
  linkId: string

  @Prop({ required: true })
  title: string

  @Prop()
  description: string

  @Prop({ required: true, min: 0 })
  amount: number

  @Prop({ default: "USD" })
  currency: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  createdBy: MongooseSchema.Types.ObjectId

  @Prop({ required: true, enum: PaymentLinkStatus, default: PaymentLinkStatus.ACTIVE })
  status: PaymentLinkStatus

  @Prop()
  expiresAt: Date

  @Prop({ default: 0 })
  usageLimit: number

  @Prop({ default: 0 })
  usageCount: number

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Transaction" }] })
  transactions: MongooseSchema.Types.ObjectId[]

  @Prop({ type: Object })
  metadata: Record<string, any>

  @Prop({ default: false })
  isReusable: boolean
}

export const PaymentLinkSchema = SchemaFactory.createForClass(PaymentLink)

// Virtual for checking if link is expired
PaymentLinkSchema.virtual("isExpired").get(function () {
  if (!this.expiresAt) {
    return false
  }

  return new Date() > new Date(this.expiresAt)
})

// Virtual for checking if link has reached usage limit
PaymentLinkSchema.virtual("isLimitReached").get(function () {
  if (this.usageLimit === 0) {
    return false
  }

  return this.usageCount >= this.usageLimit
})

// Virtual for checking if link is usable
PaymentLinkSchema.virtual("isUsable").get(function () {
  return this.status === PaymentLinkStatus.ACTIVE && !this.isExpired && !this.isLimitReached
})

