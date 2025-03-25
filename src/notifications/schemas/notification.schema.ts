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
export class Notification extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  user: MongooseSchema.Types.ObjectId

  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  message: string

  @Prop({ default: false })
  isRead: boolean

  @Prop({ required: true })
  type: string

  @Prop()
  reference: string

  @Prop({ default: false })
  isAdmin: boolean
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)

