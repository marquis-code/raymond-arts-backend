import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Schema as MongooseSchema } from "mongoose"

export type ContentDocument = Content & Document

export enum ContentType {
  HOME_HERO = "home_hero",
  PORTRAIT_HERO = "portrait_hero",
  GALLERY_HERO = "gallery_hero",
  SHOP_PRINTS_HERO = "shop_prints_hero",
  COMMISSION_HERO = "commission_hero",
  COMMISSION_INFO = "commission_info",
  CONTACT_INFO = "contact_info",
  ABOUT_SECTION = "about_section",
}

export enum ContentStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DRAFT = "draft",
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
export class Content {
  @Prop({
    required: true,
    enum: ContentType,
    unique: true,
    index: true,
  })
  type: ContentType

  @Prop({ required: true, maxlength: 200 })
  title: string

  @Prop({ maxlength: 1000 })
  description?: string

  @Prop({
    type: [String],
    validate: {
      validator: function (images: string[]) {
        // Validate based on content type
        switch (this.type) {
          case ContentType.HOME_HERO:
          case ContentType.PORTRAIT_HERO:
          case ContentType.GALLERY_HERO:
          case ContentType.COMMISSION_HERO:
          case ContentType.ABOUT_SECTION:
            return images.length === 1
          case ContentType.SHOP_PRINTS_HERO:
            return images.length === 4
          case ContentType.CONTACT_INFO:
          case ContentType.COMMISSION_INFO:
            return images.length <= 5 // Optional images for these types
          default:
            return images.length <= 10
        }
      },
      message: (props) => {
        const type = (props.instance as any).type
        switch (type) {
          case ContentType.HOME_HERO:
          case ContentType.PORTRAIT_HERO:
          case ContentType.GALLERY_HERO:
          case ContentType.COMMISSION_HERO:
          case ContentType.ABOUT_SECTION:
            return "This content type requires exactly 1 image"
          case ContentType.SHOP_PRINTS_HERO:
            return "Shop prints hero requires exactly 4 images"
          default:
            return "Maximum 10 images allowed"
        }
      },
    },
    default: [],
  })
  images: string[]

  @Prop({
    type: MongooseSchema.Types.Mixed,
    default: {},
  })
  metadata?: {
    // Common metadata
    altText?: string[]
    captions?: string[]

    // Commission-specific
    sizes?: {
      name: string
      dimensions: string
      price?: number
    }[]
    sections?: {
      title: string
      content: string
      order: number
    }[]

    // Contact-specific
    contactInfo?: {
      email?: {
        address: string
        responseTime: string
      }
      locations?: {
        name: string
        address: string
        phone: string
      }[]
      responseTime?: {
        general: string
        businessHours: string
      }
      socialMedia?: {
        platform: string
        url: string
        username?: string
      }[]
      businessInquiry?: {
        message: string
        email: string
      }
    }

    // About-specific
    aboutInfo?: {
      biography: string[]
      achievements?: string[]
      interests?: string[]
      birthYear?: number
      profession?: string[]
      artisticMediums?: string[]
      inspirations?: string[]
    }

    [key: string]: any
  }

  @Prop({
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
  })
  status: ContentStatus

  @Prop({ required: true })
  createdBy: string

  @Prop()
  updatedBy?: string

  @Prop({ default: Date.now })
  publishedAt?: Date

  createdAt?: Date
  updatedAt?: Date
}

export const ContentSchema = SchemaFactory.createForClass(Content)

// Indexes for efficient queries
ContentSchema.index({ type: 1, status: 1 })
ContentSchema.index({ status: 1, publishedAt: -1 })
ContentSchema.index({ createdBy: 1 })
