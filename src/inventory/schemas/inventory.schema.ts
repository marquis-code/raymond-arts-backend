import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"

@Schema({ _id: false })
export class InventoryHistory {
  @Prop({ required: true })
  date: Date

  @Prop({ required: true })
  action: string

  @Prop({ required: true })
  quantity: number

  @Prop()
  notes: string

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId
}

const InventoryHistorySchema = SchemaFactory.createForClass(InventoryHistory)

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
export class Inventory extends Document {
  @Prop({ type: Types.ObjectId, ref: "Product", required: true })
  product: Types.ObjectId

  @Prop({ required: true, default: 0, min: 0 })
  quantity: number

  @Prop({ default: 5, min: 0 })
  lowStockThreshold: number

  @Prop({ default: false })
  isLowStock: boolean

  @Prop({ default: false })
  isOutOfStock: boolean

  @Prop({ type: [InventoryHistorySchema], default: [] })
  history: InventoryHistory[]
}

export const InventorySchema = SchemaFactory.createForClass(Inventory)

InventorySchema.virtual("inStock").get(function () {
  return this.quantity > 0
})

InventorySchema.pre("save", function (next) {
  this.isOutOfStock = this.quantity <= 0
  this.isLowStock = this.quantity > 0 && this.quantity <= this.lowStockThreshold
  next()
})
