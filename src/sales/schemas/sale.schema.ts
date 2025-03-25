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
export class Sale extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Order", required: true })
  order: MongooseSchema.Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  customer: MongooseSchema.Types.ObjectId

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Product" }], required: true })
  products: MongooseSchema.Types.ObjectId[]

  @Prop({ required: true, min: 0 })
  amount: number

  @Prop()
  date: Date

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Transaction" })
  transaction: MongooseSchema.Types.ObjectId

  @Prop()
  notes: string
}

export const SaleSchema = SchemaFactory.createForClass(Sale)

