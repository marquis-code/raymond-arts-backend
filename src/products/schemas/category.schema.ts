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
export class Category extends Document {
  @Prop({ required: true })
  name: string

  @Prop()
  description: string

  @Prop()
  image: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Category" })
  parent: MongooseSchema.Types.ObjectId

  @Prop({ default: true })
  isActive: boolean

  @Prop({ default: 0 })
  order: number
}

export const CategorySchema = SchemaFactory.createForClass(Category)

// Virtual for getting child categories
CategorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
})

