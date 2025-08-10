// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
// import { type Document, Schema as MongooseSchema } from "mongoose"

// export type ProductReviewDocument = ProductReview & Document

// export enum ProductReviewStatus {
//   PENDING = "pending",
//   APPROVED = "approved",
//   REJECTED = "rejected",
// }

// export enum UserRole {
//   CUSTOMER = "customer",
//   ADMIN = "admin",
//   STAFF = "staff",
//   ANONYMOUS = "anonymous",
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
// export class ProductReview {
//   @Prop({
//     type: MongooseSchema.Types.ObjectId,
//     ref: "Product",
//     required: true,
//     index: true,
//   })
//   productId: MongooseSchema.Types.ObjectId

//   @Prop({
//     required: false, // Made optional for anonymous reviews
//     index: true,
//   })
//   userId?: string

//   @Prop({
//     required: false, // Made optional for anonymous reviews
//     default: "Anonymous",
//   })
//   userName?: string

//   @Prop({ required: true })
//   email: string

//   @Prop({
//     required: true,
//     enum: UserRole,
//     default: UserRole.ANONYMOUS,
//   })
//   userRole: UserRole

//   @Prop({ required: true, min: 1, max: 5 })
//   rating: number

//   @Prop({ maxlength: 1000 })
//   comment?: string

//   @Prop({ maxlength: 200 })
//   title?: string

//   @Prop({
//     type: [String],
//     default: [],
//     validate: {
//       validator: (urls: string[]) => {
//         return urls.length <= 5 // Limit to 5 images per review
//       },
//       message: "Maximum 5 images allowed per review",
//     },
//   })
//   imageUrls: string[]

//   @Prop({
//     enum: ProductReviewStatus,
//     default: ProductReviewStatus.PENDING,
//   })
//   status: ProductReviewStatus

//   @Prop()
//   approvedBy?: string

//   @Prop()
//   approvedAt?: Date

//   @Prop({ maxlength: 500 })
//   rejectionReason?: string

//   createdAt?: Date
//   updatedAt?: Date
// }

// export const ProductReviewSchema = SchemaFactory.createForClass(ProductReview)

// // Updated indexes for efficient queries
// ProductReviewSchema.index({ productId: 1, status: 1 })
// ProductReviewSchema.index({ email: 1, productId: 1 }) // Changed from userId to email for duplicate prevention
// ProductReviewSchema.index({ status: 1, createdAt: -1 })
// ProductReviewSchema.index({ userRole: 1 })
// ProductReviewSchema.index({ userId: 1 }, { sparse: true }) // Sparse index for optional userId



import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Schema as MongooseSchema, type Types } from "mongoose" // Import 'Types' here

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
  ANONYMOUS = "anonymous",
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
    type: MongooseSchema.Types.ObjectId, // This remains MongooseSchema.Types.ObjectId for the schema definition
    ref: "Product",
    required: true,
    index: true,
  })
  productId: Types.ObjectId // Change this to Types.ObjectId

  @Prop({
    required: false, // Made optional for anonymous reviews
    index: true,
  })
  userId?: string

  @Prop({
    required: false, // Made optional for anonymous reviews
    default: "Anonymous",
  })
  userName?: string

  @Prop({ required: true })
  email: string

  @Prop({
    required: true,
    enum: UserRole,
    default: UserRole.ANONYMOUS,
  })
  userRole: UserRole

  @Prop({ required: true, min: 1, max: 5 })
  rating: number

  @Prop({ maxlength: 1000 })
  comment?: string

  @Prop({ maxlength: 200 })
  title?: string

  @Prop({
    type: [String],
    default: [],
    validate: {
      validator: (urls: string[]) => {
        return urls.length <= 5 // Limit to 5 images per review
      },
      message: "Maximum 5 images allowed per review",
    },
  })
  imageUrls: string[]

  @Prop({
    enum: ProductReviewStatus,
    default: ProductReviewStatus.PENDING,
  })
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

// Updated indexes for efficient queries
ProductReviewSchema.index({ productId: 1, status: 1 })
ProductReviewSchema.index({ email: 1, productId: 1 }) // Changed from userId to email for duplicate prevention
ProductReviewSchema.index({ status: 1, createdAt: -1 })
ProductReviewSchema.index({ userRole: 1 })
ProductReviewSchema.index({ userId: 1 }, { sparse: true }) // Sparse index for optional userId
