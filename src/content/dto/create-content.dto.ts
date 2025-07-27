import {
    IsString,
    IsEnum,
    IsArray,
    IsOptional,
    MaxLength,
    IsObject,
    ValidateNested,
    ArrayMaxSize,
    IsUrl,
    IsNumber,
    Min,
  } from "class-validator"
  import { Type } from "class-transformer"
  import { ApiProperty } from "@nestjs/swagger"
  import { ContentType, ContentStatus } from "../content.schema"
  
  class SizeDto {
    @ApiProperty({ description: "Size name", example: "Small Size" })
    @IsString()
    @MaxLength(100)
    name: string
  
    @ApiProperty({ description: "Size dimensions", example: "18 x 20 inches" })
    @IsString()
    @MaxLength(100)
    dimensions: string
  
    @ApiProperty({ description: "Price for this size", required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number
  }
  
  class SectionDto {
    @ApiProperty({ description: "Section title", example: "SIZES AND PRICES" })
    @IsString()
    @MaxLength(200)
    title: string
  
    @ApiProperty({ description: "Section content" })
    @IsString()
    @MaxLength(2000)
    content: string
  
    @ApiProperty({ description: "Display order", example: 1 })
    @IsNumber()
    @Min(1)
    order: number
  }
  
  class LocationDto {
    @ApiProperty({ description: "Location name", example: "Nigeria Office" })
    @IsString()
    @MaxLength(100)
    name: string
  
    @ApiProperty({ description: "Full address", example: "Flat 1, 15a Livingstone Road, Lekki Phase 1, Lagos" })
    @IsString()
    @MaxLength(300)
    address: string
  
    @ApiProperty({ description: "Phone number", example: "+2348119963202" })
    @IsString()
    @MaxLength(20)
    phone: string
  }
  
  class SocialMediaDto {
    @ApiProperty({ description: "Social media platform", example: "Facebook" })
    @IsString()
    @MaxLength(50)
    platform: string
  
    @ApiProperty({ description: "Profile URL", example: "https://facebook.com/username" })
    @IsUrl()
    url: string
  
    @ApiProperty({ description: "Username", required: false, example: "@username" })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    username?: string
  }
  
  class ContactInfoDto {
    @ApiProperty({ description: "Email information", required: false })
    @IsOptional()
    @IsObject()
    email?: {
      address: string
      responseTime: string
    }
  
    @ApiProperty({ description: "Office locations", required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LocationDto)
    locations?: LocationDto[]
  
    @ApiProperty({ description: "Response time information", required: false })
    @IsOptional()
    @IsObject()
    responseTime?: {
      general: string
      businessHours: string
    }
  
    @ApiProperty({ description: "Social media links", required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SocialMediaDto)
    socialMedia?: SocialMediaDto[]
  
    @ApiProperty({ description: "Business inquiry information", required: false })
    @IsOptional()
    @IsObject()
    businessInquiry?: {
      message: string
      email: string
    }
  }
  
  class AboutInfoDto {
    @ApiProperty({ description: "Biography paragraphs", example: ["First paragraph", "Second paragraph"] })
    @IsArray()
    @IsString({ each: true })
    @MaxLength(1000, { each: true })
    biography: string[]
  
    @ApiProperty({ description: "Achievements", required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @MaxLength(200, { each: true })
    achievements?: string[]
  
    @ApiProperty({ description: "Interests and hobbies", required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @MaxLength(100, { each: true })
    interests?: string[]
  
    @ApiProperty({ description: "Birth year", required: false, example: 1999 })
    @IsOptional()
    @IsNumber()
    @Min(1900)
    birthYear?: number
  
    @ApiProperty({ description: "Professions", required: false, example: ["Visual Artist", "Medical Doctor"] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @MaxLength(100, { each: true })
    profession?: string[]
  
    @ApiProperty({ description: "Artistic mediums", required: false, example: ["Charcoal", "Pastel", "Acrylic"] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @MaxLength(50, { each: true })
    artisticMediums?: string[]
  
    @ApiProperty({ description: "Sources of inspiration", required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @MaxLength(200, { each: true })
    inspirations?: string[]
  }
  
  class MetadataDto {
    @ApiProperty({ description: "Alt text for images", required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    altText?: string[]
  
    @ApiProperty({ description: "Image captions", required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    captions?: string[]
  
    @ApiProperty({ description: "Size options for commission", required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SizeDto)
    sizes?: SizeDto[]
  
    @ApiProperty({ description: "Content sections", required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SectionDto)
    sections?: SectionDto[]
  
    @ApiProperty({ description: "Contact information", required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => ContactInfoDto)
    contactInfo?: ContactInfoDto
  
    @ApiProperty({ description: "About section information", required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => AboutInfoDto)
    aboutInfo?: AboutInfoDto
  }
  
  export class CreateContentDto {
    @ApiProperty({
      description: "Content type",
      enum: ContentType,
      example: ContentType.HOME_HERO,
    })
    @IsEnum(ContentType)
    type: ContentType
  
    @ApiProperty({
      description: "Content title",
      example: "Welcome to Our Art Gallery",
    })
    @IsString()
    @MaxLength(200)
    title: string
  
    @ApiProperty({
      description: "Content description",
      required: false,
      example: "Beautiful hero image for the home page",
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string
  
    @ApiProperty({
      description: "Array of image URLs",
      required: false,
      example: ["https://example.com/hero-image.jpg"],
    })
    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    @ArrayMaxSize(10)
    images?: string[]
  
    @ApiProperty({
      description: "Additional metadata",
      required: false,
    })
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => MetadataDto)
    metadata?: MetadataDto
  
    @ApiProperty({
      description: "Content status",
      enum: ContentStatus,
      default: ContentStatus.DRAFT,
    })
    @IsOptional()
    @IsEnum(ContentStatus)
    status?: ContentStatus
  }
  