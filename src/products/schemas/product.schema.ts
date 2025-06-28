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

// Installment configuration for individual sizes
export class SizeInstallmentConfig {
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

  @Prop({ min: 0, max: 100, default: 20 })
  minimumDownPaymentPercentage: number // Minimum down payment percentage

  @Prop({ min: 0, max: 100, default: 50 })
  maximumDownPaymentPercentage: number // Maximum down payment percentage
}

export class SizePrice {
  @Prop({ required: true, enum: ProductSize })
  size: ProductSize

  @Prop({ required: true, min: 0 })
  price: number

  @Prop({ default: ProductColor.BLACK, enum: ProductColor })
  color: ProductColor

  // Installment configuration specific to this size/price
  @Prop({ type: SizeInstallmentConfig, default: () => ({ enabled: false }) })
  installmentConfig: SizeInstallmentConfig
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

// Global installment configuration (fallback for products without size-specific configs)
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

  @Prop({ min: 0, max: 100, default: 20 })
  minimumDownPaymentPercentage: number // Minimum down payment percentage

  @Prop({ min: 0, max: 100, default: 50 })
  maximumDownPaymentPercentage: number // Maximum down payment percentage
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

  // Updated sizes with installment configuration per size
  @Prop({ type: [SizePrice], default: [] })
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

  // Global installment configuration (fallback)
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

// Virtual method to get installment config for a specific size
ProductSchema.methods.getInstallmentConfigForSize = function(sizeValue: string) {
  // First, try to find size-specific configuration
  const sizeConfig = this.sizes?.find((s: any) => s.size === sizeValue)
  
  if (sizeConfig?.installmentConfig?.enabled) {
    return {
      ...sizeConfig.installmentConfig,
      price: sizeConfig.price // Include the price for calculations
    }
  }
  
  // Fallback to global installment configuration
  if (this.installmentConfig?.enabled) {
    // Use the size price if available, otherwise use base price
    const price = sizeConfig?.price || this.discountPrice || this.price
    return {
      ...this.installmentConfig,
      price
    }
  }
  
  return null
}

// Virtual method to check if any size has installment enabled
ProductSchema.virtual("hasInstallmentOptions").get(function () {
  // Check if any size has installment enabled
  const hasSizeInstallments = this.sizes?.some((size: any) => size.installmentConfig?.enabled)
  
  // Or if global installment is enabled
  const hasGlobalInstallments = this.installmentConfig?.enabled
  
  return hasSizeInstallments || hasGlobalInstallments
})