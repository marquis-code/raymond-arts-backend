import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"
import { UserRole } from "../enums/user-role.enum"

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.password
      delete ret.resetToken
      delete ret.resetTokenExpiry
      delete ret.__v
      return ret
    },
  },
})
export class User extends Document {
  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ default: UserRole.CUSTOMER, enum: UserRole })
  role: UserRole

  @Prop()
  phone: string

  @Prop()
  address: string

  @Prop()
  city: string

  @Prop()
  state: string

  @Prop()
  country: string

  @Prop()
  postalCode: string

  @Prop()
  profileImage: string

  @Prop()
  resetToken: string

  @Prop()
  resetTokenExpiry: Date

  @Prop({ default: true })
  isActive: boolean

  @Prop({ default: false })
  isEmailVerified: boolean

  @Prop()
  emailVerificationToken: string

  @Prop()
  lastLogin: Date
}

export const UserSchema = SchemaFactory.createForClass(User)

// Virtual for full name
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

