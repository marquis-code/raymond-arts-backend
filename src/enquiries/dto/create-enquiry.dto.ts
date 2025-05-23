import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength } from "class-validator"

export class CreateEnquiryDto {
  @IsNotEmpty({ message: "Name is required" })
  @IsString({ message: "Name must be a string" })
  @MinLength(2, { message: "Name must be at least 2 characters long" })
  name: string

  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string

  @IsNotEmpty({ message: "Phone number is required" })
  @IsString({ message: "Phone must be a string" })
  @MinLength(10, { message: "Phone number must be at least 10 characters long" })
  phone: string

  @IsNotEmpty({ message: "Subject is required" })
  @IsString({ message: "Subject must be a string" })
  @MinLength(3, { message: "Subject must be at least 3 characters long" })
  subject: string

  @IsNotEmpty({ message: "Message is required" })
  @IsString({ message: "Message must be a string" })
  @MinLength(10, { message: "Message must be at least 10 characters long" })
  message: string

  @IsOptional()
  @IsString({ message: "Company must be a string" })
  company?: string
}
