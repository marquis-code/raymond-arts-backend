import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common"
import { Model, Types } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"
import { Content, ContentDocument, ContentType, ContentStatus } from "./content.schema"
import { CreateContentDto } from "./dto/create-content.dto"
import { UpdateContentDto } from "./dto/update-content.dto"

@Injectable()
export class ContentService {
  constructor(@InjectModel(Content.name) private contentModel: Model<ContentDocument>) {}

  async create(createContentDto: CreateContentDto, userId: string): Promise<Content> {
    try {
      // Check if content type already exists (since each type should be unique)
      const existingContent = await this.contentModel.findOne({
        type: createContentDto.type,
      })

      if (existingContent) {
        throw new ConflictException(`Content of type ${createContentDto.type} already exists. Use update instead.`)
      }

      // Validate image count based on content type
      if (createContentDto.images && createContentDto.images.length > 0) {
        this.validateImageCount(createContentDto.type, createContentDto.images.length)
      }

      const contentData = {
        ...createContentDto,
        images: createContentDto.images || [],
        createdBy: userId,
        publishedAt: createContentDto.status === ContentStatus.ACTIVE ? new Date() : undefined,
      }

      const content = await this.contentModel.create(contentData)
      return content
    } catch (error) {
      if (error.name === "ValidationError") {
        throw new BadRequestException(`Validation error: ${error.message}`)
      }
      throw error
    }
  }

  async findAll(
    filters: { type?: ContentType; status?: ContentStatus } = {},
    page = 1,
    limit = 10,
  ): Promise<{
    content: Content[]
    total: number
    page: number
    totalPages: number
  }> {
    const query: any = {}

    if (filters.type) query.type = filters.type
    if (filters.status) query.status = filters.status

    const skip = (page - 1) * limit

    const [content, total] = await Promise.all([
      this.contentModel.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).exec(),
      this.contentModel.countDocuments(query),
    ])

    return {
      content,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findPublic(type?: ContentType): Promise<Content[]> {
    const query: any = { status: ContentStatus.ACTIVE }
    if (type) query.type = type

    return this.contentModel.find(query).sort({ publishedAt: -1 }).exec()
  }

  async findByType(type: ContentType): Promise<Content | null> {
    return this.contentModel.findOne({ type }).exec()
  }

  async findOne(id: string): Promise<Content> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid content ID")
    }

    const content = await this.contentModel.findById(id).exec()
    if (!content) {
      throw new NotFoundException("Content not found")
    }

    return content
  }

  async update(id: string, updateContentDto: UpdateContentDto, userId: string): Promise<Content> {
    const content = await this.findOne(id)

    // Validate image count if images are being updated
    if (updateContentDto.images) {
      this.validateImageCount(content.type, updateContentDto.images.length)
    }

    // Prepare update data
    const updateData: any = {
      ...updateContentDto,
      updatedBy: userId,
    }

    // Update publishedAt if status is being changed to active
    if (updateContentDto.status === ContentStatus.ACTIVE && content.status !== ContentStatus.ACTIVE) {
      updateData.publishedAt = new Date()
    }

    const updatedContent = await this.contentModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .exec()

    if (!updatedContent) {
      throw new NotFoundException("Content not found")
    }

    return updatedContent
  }

  async updateStatus(id: string, status: ContentStatus, userId: string): Promise<Content> {
    const content = await this.findOne(id)

    const updateData: any = {
      status,
      updatedBy: userId,
    }

    // Set publishedAt when activating content
    if (status === ContentStatus.ACTIVE && content.status !== ContentStatus.ACTIVE) {
      updateData.publishedAt = new Date()
    }

    const updatedContent = await this.contentModel.findByIdAndUpdate(id, updateData, { new: true }).exec()

    if (!updatedContent) {
      throw new NotFoundException("Content not found")
    }

    return updatedContent
  }

  async remove(id: string): Promise<void> {
    const result = await this.contentModel.findByIdAndDelete(id).exec()
    if (!result) {
      throw new NotFoundException("Content not found")
    }
  }

  private validateImageCount(type: ContentType, imageCount: number): void {
    const requirements = {
      [ContentType.HOME_HERO]: 1,
      [ContentType.PORTRAIT_HERO]: 1,
      [ContentType.GALLERY_HERO]: 1,
      [ContentType.COMMISSION_HERO]: 1,
      [ContentType.ABOUT_SECTION]: 1,
      [ContentType.SHOP_PRINTS_HERO]: 4,
      [ContentType.CONTACT_INFO]: 0, // No specific requirement
      [ContentType.COMMISSION_INFO]: 0, // No specific requirement
    }

    const required = requirements[type]
    if (required && imageCount !== required) {
      throw new BadRequestException(
        `${type} requires exactly ${required} image${required > 1 ? "s" : ""}, but ${imageCount} provided`,
      )
    }
  }

  async seedDefaultContent(userId: string): Promise<{ message: string; created: number }> {
    const defaultContent = [
      {
        type: ContentType.HOME_HERO,
        title: "Welcome to Our Art Gallery",
        description: "Discover beautiful artworks and commission custom pieces",
        images: ["https://example.com/home-hero.jpg"],
        status: ContentStatus.DRAFT,
        metadata: {
          altText: ["Home hero image"],
          captions: ["Welcome to our art gallery"],
        },
      },
      {
        type: ContentType.PORTRAIT_HERO,
        title: "Custom Portraits",
        description: "Professional portrait commissions",
        images: ["https://example.com/portrait-hero.jpg"],
        status: ContentStatus.DRAFT,
        metadata: {
          altText: ["Portrait hero image"],
          captions: ["Custom portrait commissions"],
        },
      },
      {
        type: ContentType.GALLERY_HERO,
        title: "Art Gallery",
        description: "Browse our collection of artworks",
        images: ["https://example.com/gallery-hero.jpg"],
        status: ContentStatus.DRAFT,
        metadata: {
          altText: ["Gallery hero image"],
          captions: ["Browse our art collection"],
        },
      },
      {
        type: ContentType.SHOP_PRINTS_HERO,
        title: "Shop Art Prints",
        description: "High-quality art prints available for purchase",
        images: [
          "https://example.com/print1.jpg",
          "https://example.com/print2.jpg",
          "https://example.com/print3.jpg",
          "https://example.com/print4.jpg",
        ],
        status: ContentStatus.DRAFT,
        metadata: {
          altText: ["Art print 1", "Art print 2", "Art print 3", "Art print 4"],
          captions: ["Featured print 1", "Featured print 2", "Featured print 3", "Featured print 4"],
        },
      },
      {
        type: ContentType.COMMISSION_HERO,
        title: "Commission Artwork",
        description: "Get your custom artwork commissioned",
        images: ["https://example.com/commission-hero.jpg"],
        status: ContentStatus.DRAFT,
        metadata: {
          altText: ["Commission hero image"],
          captions: ["Commission custom artwork"],
        },
      },
      {
        type: ContentType.COMMISSION_INFO,
        title: "Commission Information",
        description: "Everything you need to know about commissioning artwork",
        images: [],
        status: ContentStatus.DRAFT,
        metadata: {
          sizes: [
            { name: "Small Size", dimensions: "18 x 20 inches", price: 150 },
            { name: "Basic Size", dimensions: "20 x 24 inches", price: 200 },
            { name: "Medium Size", dimensions: "24 x 30 / 24 x36 inches", price: 300 },
            { name: "Large Size", dimensions: "36 x 42 inches", price: 450 },
            { name: "Extra Large Size", dimensions: "40 x 46 inches", price: 600 },
          ],
          sections: [
            {
              title: "SIZES AND PRICES",
              content: "Depending on your wall space, budget and photographs. I offer the following sizes:",
              order: 1,
            },
            {
              title: "REFERENCE PHOTO",
              content:
                "To create your drawing, you have to choose a reference photo. It is important to be able to determine which photo will allow for the best possible reference material, the clearer the photo, the better the portrait. That way I am able to achieve the desired final result. I draw portraits, preferably a head and shoulder portraits. But also pets or landscapes.",
              order: 2,
            },
            {
              title: "CONTRACT & PAYMENT",
              content:
                "Commissions require an initial deposit and contractual agreement. Once you have your chosen the portrait size and reference photo, simply submit your commission through the submission form. We will then discuss further details of your drawing. Payment can be made securely through Card, bank transfer, Western Union, Ria, Money Gram.",
              order: 3,
            },
            {
              title: "TIME OF CREATION",
              content:
                "After your deposit has been successfully received, I will start working on your drawing. It is important to allow enough time for creation of the artwork. I will inform you on time needed depending on your choice of size and photo (At least 2-4 weeks). During this process you will receive updates of your drawing. That way you get to watch your artwork come together until it is completed.",
              order: 4,
            },
            {
              title: "SHIPPING",
              content:
                "The most exciting part! Your drawing has been approved by you and will now be prepared for shipment. I ship with DHL Express Fed Ex, and USPS worldwide. Estimated delivery time is 4-7 business days worldwide. Artworks are shipped rolled in a protective tube. All packages are well protected and insured for a guaranteed safe arrival of your artwork.",
              order: 5,
            },
          ],
        },
      },
      {
        type: ContentType.CONTACT_INFO,
        title: "Contact Information",
        description: "Get in touch through these channels",
        images: [],
        status: ContentStatus.DRAFT,
        metadata: {
          contactInfo: {
            email: {
              address: "hello@raymondaworoart.com",
              responseTime: "I'll respond within 24 hours",
            },
            locations: [
              {
                name: "Nigeria Office",
                address: "Flat 1, 15a Livingstone Road, Lekki Phase 1, Lagos",
                phone: "+2348119963202",
              },
              {
                name: "U.S. Office",
                address: "1234 Main Street, Suite 100, Wilmington, DE 19801",
                phone: "+1 (569) 859-5124",
              },
            ],
            responseTime: {
              general: "Usually within 24 hours",
              businessHours: "Monday - Friday, 9 AM - 6 PM WAT",
            },
            socialMedia: [
              { platform: "Facebook", url: "https://facebook.com/raymondaworo", username: "@raymondaworo" },
              { platform: "Instagram", url: "https://instagram.com/raymondaworo", username: "@raymondaworo" },
              { platform: "Twitter", url: "https://twitter.com/raymondaworo", username: "@raymondaworo" },
              { platform: "TikTok", url: "https://tiktok.com/@raymondaworo", username: "@raymondaworo" },
              { platform: "YouTube", url: "https://youtube.com/raymondaworo", username: "Raymond Aworo" },
            ],
            businessInquiry: {
              message: "For business inquiries or collaborations, please email me directly at",
              email: "hello@raymondaworoart.com",
            },
          },
        },
      },
      {
        type: ContentType.ABOUT_SECTION,
        title: "About Raymond Aworo",
        description: "Learn about the artist behind the work",
        images: ["https://example.com/raymond-photo.jpg"],
        status: ContentStatus.DRAFT,
        metadata: {
          altText: ["Raymond Aworo - Artist Photo"],
          aboutInfo: {
            biography: [
              "Raymond Aworo (born in 1999) is a hyper-realistic visual artist and also a medical doctor in training who was born in Nigeria. He started drawing at the age of 12. He's a self-taught artist who expresses in charcoal, pastel and acrylic paint and also nature photography.",
              "He draws inspiration primarily from his Faith(Christianity), personal life struggles and immediate environment.",
              "As he continues to explore his creativity and perfect his style, Raymond has debuted his works at few exhibitions while working on more international exhibitions.",
              "He enjoys listening to music, eating, playing football, editing videos and creating content for his fans on social media.",
            ],
            birthYear: 1999,
            profession: ["Visual Artist", "Medical Doctor in Training"],
            artisticMediums: ["Charcoal", "Pastel", "Acrylic Paint", "Nature Photography"],
            inspirations: ["Faith (Christianity)", "Personal Life Struggles", "Immediate Environment"],
            interests: [
              "Listening to Music",
              "Eating",
              "Playing Football",
              "Editing Videos",
              "Creating Social Media Content",
            ],
          },
        },
      },
    ]

    let created = 0
    for (const contentData of defaultContent) {
      try {
        const existing = await this.contentModel.findOne({ type: contentData.type })
        if (!existing) {
          await this.contentModel.create({
            ...contentData,
            createdBy: userId,
          })
          created++
        }
      } catch (error) {
        console.error(`Failed to create ${contentData.type}:`, error)
      }
    }

    return {
      message: `Default content seeding completed. ${created} new content items created.`,
      created,
    }
  }
}
