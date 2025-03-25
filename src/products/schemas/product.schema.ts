import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Schema as MongooseSchema } from "mongoose"

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
}

export const ProductSchema = SchemaFactory.createForClass(Product)

// Virtual for calculating discount percentage
ProductSchema.virtual("discountPercentage").get(function () {
  if (!this.discountPrice || this.discountPrice === 0 || this.price === 0) {
    return 0
  }
  return Math.round(((this.price - this.discountPrice) / this.price) * 100)
})

