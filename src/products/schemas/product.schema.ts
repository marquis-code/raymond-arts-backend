// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
// import { Document, Schema as MongooseSchema } from "mongoose"

// export enum ProductSize {
//   SMALL = 'small',
//   BASIC = 'basic',
//   MEDIUM = 'medium',
//   LARGE = 'large',
// }

// export enum ProductColor {
//   BLACK = 'black',
//   WHITE = 'white'
// }

// export class SizePrice {
//   @Prop({ required: true, enum: ProductSize })
//   size: ProductSize;

//   @Prop({ required: true, min: 0 })
//   price: number;

//   @Prop({ default: ProductColor.BLACK, enum: ProductColor })
//   color: ProductColor
// }

// export class Review {
//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
//   user: MongooseSchema.Types.ObjectId;

//   @Prop({ required: true, min: 1, max: 5 })
//   rating: number;

//   @Prop({ required: true })
//   comment: string;

//   @Prop({ default: Date.now })
//   createdAt: Date;
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
// export class Product extends Document {
//   @Prop({ required: true })
//   name: string

//   @Prop({ required: true })
//   description: string

//   @Prop({ required: true, min: 0 })
//   price: number

//   @Prop({ default: 0, min: 0 })
//   discountPrice: number

//   @Prop({ type: [String], default: [] })
//   images: string[]

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Category" })
//   category: MongooseSchema.Types.ObjectId

//   @Prop({ default: true })
//   isAvailable: boolean

//   @Prop({ default: 0, min: 0 })
//   weight: number

//   @Prop({ default: 0, min: 0 })
//   width: number

//   @Prop({ default: 0, min: 0 })
//   height: number

//   @Prop({ default: 0, min: 0 })
//   length: number

//   @Prop({ type: [String], default: [] })
//   tags: string[]

//   @Prop({ type: Object, default: {} })
//   attributes: Record<string, any>

//   @Prop({ default: 0 })
//   viewCount: number

//   @Prop({ default: 0 })
//   soldCount: number

//   @Prop({ default: 0 })
//   rating: number

//   @Prop({ default: 0 })
//   reviewCount: number

//   @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Product" }] })
//   relatedProducts: MongooseSchema.Types.ObjectId[]

//   @Prop({ default: false })
//   isFeatured: boolean

//   @Prop({ default: false })
//   isNew: boolean

//   @Prop({ default: false })
//   isBestseller: boolean

//   // New fields
//   @Prop({ type: String })
//   productInfo: string;

//   @Prop({ type: String })
//   returnPolicy: string;

//   @Prop({ type: String })
//   shippingInfo: string;

//   @Prop({ type: [{ size: String, price: Number }], default: [] })
//   sizes: SizePrice[];

//   @Prop({ type: String })
//   promotionText: string;

//   @Prop({ type: [{
//     user: { type: MongooseSchema.Types.ObjectId, ref: 'User' },
//     rating: Number,
//     comment: String,
//     createdAt: { type: Date, default: Date.now }
//   }], default: [] })
//   reviews: Review[];
// }

// export const ProductSchema = SchemaFactory.createForClass(Product)

// // Virtual for calculating discount percentage
// ProductSchema.virtual("discountPercentage").get(function () {
//   if (!this.discountPrice || this.discountPrice === 0 || this.price === 0) {
//     return 0
//   }
//   return Math.round(((this.price - this.discountPrice) / this.price) * 100)
// })

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Schema as MongooseSchema } from "mongoose"

export enum ProductSize {
  SMALL = "small",
  BASIC = "basic",
  MEDIUM = "medium",
  LARGE = "large",
}

export enum ProductColor {
  BLACK = "black",
  WHITE = "white",
}

export class SizePrice {
  @Prop({ required: true, enum: ProductSize })
  size: ProductSize

  @Prop({ required: true, min: 0 })
  price: number

  @Prop({ default: ProductColor.BLACK, enum: ProductColor })
  color: ProductColor
}

export class Review {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  user: MongooseSchema.Types.ObjectId

  @Prop({ required: true, min: 1, max: 5 })
  rating: number

  @Prop({ required: true })
  comment: string

  @Prop({ default: Date.now })
  createdAt: Date
}

// New installment configuration class
export class InstallmentConfig {
  @Prop({ default: false })
  enabled: boolean

  @Prop({ min: 2, max: 24 })
  maxInstallments: number

  @Prop({ min: 0, max: 100 })
  interestRate: number // Annual interest rate percentage

  @Prop({ min: 0 })
  minimumAmount: number // Minimum order amount to qualify for installments

  @Prop({ type: [Number], default: [3, 6, 12] })
  availableTerms: number[] // Available installment terms in months
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
export class Product extends Document {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  description: string

  @Prop({ required: true, min: 0 })
  price: number

  @Prop({ default: 0, min: 0 })
  discountPrice: number

  @Prop({ type: [String], default: [] })
  images: string[]

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Category" })
  category: MongooseSchema.Types.ObjectId

  @Prop({ default: true })
  isAvailable: boolean

  @Prop({ default: 0, min: 0 })
  weight: number

  @Prop({ default: 0, min: 0 })
  width: number

  @Prop({ default: 0, min: 0 })
  height: number

  @Prop({ default: 0, min: 0 })
  length: number

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ type: Object, default: {} })
  attributes: Record<string, any>

  @Prop({ default: 0 })
  viewCount: number

  @Prop({ default: 0 })
  soldCount: number

  @Prop({ default: 0 })
  rating: number

  @Prop({ default: 0 })
  reviewCount: number

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Product" }] })
  relatedProducts: MongooseSchema.Types.ObjectId[]

  @Prop({ default: false })
  isFeatured: boolean

  @Prop({ default: false })
  isNew: boolean

  @Prop({ default: false })
  isBestseller: boolean

  @Prop({ type: String })
  productInfo: string

  @Prop({ type: String })
  returnPolicy: string

  @Prop({ type: String })
  shippingInfo: string

  @Prop({ type: [{ size: String, price: Number }], default: [] })
  sizes: SizePrice[]

  @Prop({ type: String })
  promotionText: string

  @Prop({
    type: [
      {
        user: { type: MongooseSchema.Types.ObjectId, ref: "User" },
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  reviews: Review[]

  // New installment configuration
  @Prop({ type: InstallmentConfig, default: () => ({ enabled: false }) })
  installmentConfig: InstallmentConfig
}

export const ProductSchema = SchemaFactory.createForClass(Product)

// Virtual for calculating discount percentage
ProductSchema.virtual("discountPercentage").get(function () {
  if (!this.discountPrice || this.discountPrice === 0 || this.price === 0) {
    return 0
  }
  return Math.round(((this.price - this.discountPrice) / this.price) * 100)
})
