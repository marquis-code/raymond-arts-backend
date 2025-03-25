import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Schema as MongooseSchema } from "mongoose"

@Schema({ timestamps: true })
export class Audit extends Document {
  @Prop({ required: true })
  action: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  userId: MongooseSchema.Types.ObjectId

  @Prop()
  module: string

  @Prop()
  description: string

  @Prop()
  changes: string

  @Prop()
  ipAddress: string

  @Prop()
  userAgent: string
}

export const AuditSchema = SchemaFactory.createForClass(Audit)

