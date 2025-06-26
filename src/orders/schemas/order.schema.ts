// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
// import { Document, Schema as MongooseSchema, Types } from "mongoose"
// import { OrderStatus } from "../enums/order-status.enum"
// import { PaymentStatus } from "../enums/payment-status.enum"

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
// export class Order extends Document {
//   @Prop({ required: true, unique: true })
//   orderNumber: string

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
//   customer: MongooseSchema.Types.ObjectId

//   @Prop({
//     type: [
//       {
//         product: { type: MongooseSchema.Types.ObjectId, ref: "Product", required: true },
//         quantity: { type: Number, required: true, min: 1 },
//         price: { type: Number, required: true, min: 0 },
//         total: { type: Number, required: true, min: 0 },
//       },
//     ],
//     required: true,
//   })
  
//   items: Array<{
//     product: MongooseSchema.Types.ObjectId
//     quantity: number
//     price: number
//     total: number
//   }>

//   @Prop({ required: true, min: 0 })
//   subtotal: number

//   @Prop({ required: true, min: 0 })
//   tax: number

//   @Prop({ required: true, min: 0, default: 2.5 })
//   taxRate: number;

//   @Prop({ required: true, min: 0 })
//   shipping: number

//   @Prop({ required: true, min: 0 })
//   total: number

//   @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
//   status: OrderStatus

//   @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
//   paymentStatus: PaymentStatus

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Transaction" })
//   transaction: Types.ObjectId 
//   // transaction: MongooseSchema.Types.ObjectId

//   @Prop({
//     type: {
//       firstName: { type: String, required: true },
//       lastName: { type: String, required: true },
//       address: { type: String, required: true },
//       city: { type: String, required: true },
//       state: { type: String, required: true },
//       country: { type: String, required: true },
//       postalCode: { type: String, required: true },
//       phone: { type: String, required: true },
//       email: { type: String, required: true },
//     },
//     required: true,
//   })
//   shippingAddress: {
//     firstName: string
//     lastName: string
//     address: string
//     city: string
//     state: string
//     country: string
//     postalCode: string
//     phone: string
//     email: string
//   }

//   @Prop({
//     type: {
//       firstName: { type: String, required: true },
//       lastName: { type: String, required: true },
//       address: { type: String, required: true },
//       city: { type: String, required: true },
//       state: { type: String, required: true },
//       country: { type: String, required: true },
//       postalCode: { type: String, required: true },
//       phone: { type: String, required: true },
//       email: { type: String, required: true },
//     },
//     required: true,
//   })
//   billingAddress: {
//     firstName: string
//     lastName: string
//     address: string
//     city: string
//     state: string
//     country: string
//     postalCode: string
//     phone: string
//     email: string
//   }

//   @Prop()
//   notes: string

//   @Prop({ type: [{ type: Object }], default: [] })
//   statusHistory: Array<{
//     status: OrderStatus
//     date: Date
//     notes: string,
//     userId: Types.ObjectId
//     // userId: MongooseSchema.Types.ObjectId
//   }>

//   @Prop()
//   trackingNumber: string

//   @Prop()
//   trackingUrl: string

//   @Prop()
//   estimatedDelivery: Date

//   @Prop()
//   shippedAt: Date

//   @Prop()
//   deliveredAt: Date

//   @Prop()
//   cancelledAt: Date

//   @Prop()
//   returnedAt: Date

//   @Prop()
//   refundedAt: Date
// }

// export const OrderSchema = SchemaFactory.createForClass(Order)

// OrderSchema.virtual("age").get(function (this: any) {
//   return Math.floor((Date.now() - (this.createdAt ? this.createdAt.getTime() : Date.now())) / (1000 * 60 * 60 * 24));
// });



import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Schema as MongooseSchema, type Types } from "mongoose"
import { OrderStatus } from "../enums/order-status.enum"
import { PaymentStatus } from "../enums/payment-status.enum"

export enum PaymentType {
  FULL = "full",
  INSTALLMENT = "installment",
}

export class InstallmentInfo {
  @Prop({ default: false })
  isInstallment: boolean

  @Prop()
  installmentPlan: MongooseSchema.Types.ObjectId

  @Prop()
  numberOfInstallments: number

  @Prop()
  downPayment: number

  @Prop()
  installmentAmount: number

  @Prop()
  interestRate: number

  @Prop()
  totalPayable: number
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

  @Prop({
    type: [
      {
        product: { type: MongooseSchema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 },
      },
    ],
    required: true,
  })
  items: Array<{
    product: MongooseSchema.Types.ObjectId
    quantity: number
    price: number
    total: number
  }>

  @Prop({ required: true, min: 0 })
  subtotal: number

  @Prop({ required: true, min: 0 })
  tax: number

  @Prop({ required: true, min: 0, default: 2.5 })
  taxRate: number

  @Prop({ required: true, min: 0 })
  shipping: number

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
  transaction: Types.ObjectId

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
  shippingAddress: {
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

  @Prop()
  notes: string

  @Prop({ type: [{ type: Object }], default: [] })
  statusHistory: Array<{
    status: OrderStatus
    date: Date
    notes: string
    userId: Types.ObjectId
  }>

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
}

export const OrderSchema = SchemaFactory.createForClass(Order)

OrderSchema.virtual("age").get(function (this: any) {
  return Math.floor((Date.now() - (this.createdAt ? this.createdAt.getTime() : Date.now())) / (1000 * 60 * 60 * 24))
})
