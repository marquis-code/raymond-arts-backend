import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Schema as MongooseSchema } from "mongoose"
import { InvoiceStatus } from "../enums/invoice-status.enum"

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
export class Invoice extends Document {
  @Prop({ required: true, unique: true })
  invoiceNumber: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  customer: MongooseSchema.Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Order" })
  order: MongooseSchema.Types.ObjectId

  @Prop({
    type: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 },
      },
    ],
    required: true,
  })
  items: Array<{
    description: string
    quantity: number
    price: number
    total: number
  }>

  @Prop({ required: true, min: 0 })
  subtotal: number

  @Prop({ required: true, min: 0 })
  tax: number

  @Prop({ required: true, min: 0 })
  total: number

  @Prop({ required: true, enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Transaction" })
  transaction: MongooseSchema.Types.ObjectId

  @Prop({ required: true })
  dueDate: Date

  @Prop()
  paidDate: Date

  @Prop()
  notes: string

  @Prop({
    type: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    required: true,
  })
  billingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    country: string
    postalCode: string
    phone: string
    email: string
  }
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice)

// Virtual for calculating days overdue
InvoiceSchema.virtual("daysOverdue").get(function () {
  if (this.status !== InvoiceStatus.PENDING) {
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

