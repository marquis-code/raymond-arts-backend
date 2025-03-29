// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
// import { Document, Schema as MongooseSchema } from "mongoose"

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
// export class Contact extends Document {
//   @Prop({ required: true })
//   firstName: string

//   @Prop({ required: true })
//   lastName: string

//   @Prop({ required: true, unique: true })
//   email: string

//   @Prop()
//   phone: string

//   @Prop()
//   company: string

//   @Prop()
//   position: string

//   @Prop()
//   address: string

//   @Prop()
//   city: string

//   @Prop()
//   state: string

//   @Prop()
//   country: string

//   @Prop()
//   postalCode: string

//   @Prop()
//   notes: string

//   @Prop({ type: [String], default: [] })
//   tags: string[]

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
//   createdBy: MongooseSchema.Types.ObjectId

//   @Prop({ type: [{ type: Object }], default: [] })
//   interactions: Array<{
//     date: Date
//     type: string
//     notes: string
//     userId: MongooseSchema.Types.ObjectId
//   }>
// }

// export const ContactSchema = SchemaFactory.createForClass(Contact)

// // Virtual for full name
// ContactSchema.virtual("fullName").get(function () {
//   return `${this.firstName} ${this.lastName}`
// })



import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"

@Schema({ _id: false })
export class Interaction {
  @Prop({ required: true })
  date: Date

  @Prop({ required: true })
  type: string

  @Prop()
  notes: string

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId
}

const InteractionSchema = SchemaFactory.createForClass(Interaction)

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
export class Contact extends Document {
  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop()
  phone: string

  @Prop()
  company: string

  @Prop()
  position: string

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
  notes: string

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  createdBy: Types.ObjectId

  @Prop({ type: [InteractionSchema], default: [] })
  interactions: Interaction[]
}

export const ContactSchema = SchemaFactory.createForClass(Contact)

// Virtual for full name
ContactSchema.virtual("fullName").get(function (this: Contact) {
  return `${this.firstName} ${this.lastName}`
})
