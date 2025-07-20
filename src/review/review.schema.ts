import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Schema as MongooseSchema } from "mongoose"

export type ProductReviewDocument = ProductReview & Document

export enum ProductReviewStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum UserRole {
  CUSTOMER = "customer",
  ADMIN = "admin",
  STAFF = "staff",
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
export class ProductReview {
  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: "Product", 
    required: true,
    index: true
  })
  productId: MongooseSchema.Types.ObjectId

  @Prop({ 
    required: true,
    index: true
  })
  userId: string

  @Prop({ required: true })
  userName: string

  @Prop({ required: true, enum: UserRole })
  userRole: UserRole

  @Prop({ required: true, min: 1, max: 5 })
  rating: number

  @Prop({ maxlength: 1000 })
  comment?: string

  @Prop({ maxlength: 200 })
  title?: string

  @Prop({ enum: ProductReviewStatus, default: ProductReviewStatus.PENDING })
  status: ProductReviewStatus

  @Prop()
  approvedBy?: string

  @Prop()
  approvedAt?: Date

  @Prop({ maxlength: 500 })
  rejectionReason?: string

  createdAt?: Date
  updatedAt?: Date
}

export const ProductReviewSchema = SchemaFactory.createForClass(ProductReview)

// Compound indexes for efficient queries
ProductReviewSchema.index({ productId: 1, status: 1 })
ProductReviewSchema.index({ userId: 1, productId: 1 }, { unique: true }) // Prevent duplicate reviews
ProductReviewSchema.index({ status: 1, createdAt: -1 })
ProductReviewSchema.index({ userRole: 1 })