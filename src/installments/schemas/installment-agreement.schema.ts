import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Schema as MongooseSchema } from "mongoose"

export enum AgreementStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  EXPIRED = "expired",
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
export class InstallmentAgreement extends Document {
  @Prop({ required: true, unique: true })
  agreementNumber: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  customer: MongooseSchema.Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "InstallmentPlan", required: true })
  installmentPlan: MongooseSchema.Types.ObjectId

  @Prop({ required: true })
  agreementText: string

  @Prop({ required: true })
  termsAndConditions: string

  @Prop({ required: true, enum: AgreementStatus, default: AgreementStatus.PENDING })
  status: AgreementStatus

  @Prop()
  acceptedAt: Date

  @Prop()
  rejectedAt: Date

  @Prop()
  expiresAt: Date

  @Prop()
  customerSignature: string

  @Prop()
  customerIP: string

  @Prop()
  agreementHash: string

  @Prop({ type: Object })
  agreementData: Record<string, any>

  @Prop()
  notes: string
}

export const InstallmentAgreementSchema = SchemaFactory.createForClass(InstallmentAgreement)