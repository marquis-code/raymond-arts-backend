import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  UsePipes,
  HttpException,
  HttpStatus,
  Logger,
  Body
} from "@nestjs/common"
import { EnquiriesService } from "./enquiries.service"
import { CreateEnquiryDto } from "./dto/create-enquiry.dto"
import { UpdateEnquiryDto } from "./dto/update-enquiry.dto"

@Controller("enquiries")
export class EnquiriesController {
  private readonly logger = new Logger(EnquiriesController.name)

  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validateCustomDecorators: true,
    }),
  )
  async create(@Body() createEnquiryDto: CreateEnquiryDto) {
    try {
      this.logger.log("Creating new enquiry", {
        email: createEnquiryDto.email,
        subject: createEnquiryDto.subject,
      })

      // Log the received data for debugging
      this.logger.debug("Received enquiry data:", createEnquiryDto)

      const enquiry = await this.enquiriesService.create(createEnquiryDto)

      this.logger.log("Enquiry created successfully", { id: enquiry._id })

      return {
        success: true,
        message: "Enquiry submitted successfully",
        data: enquiry,
      }
    } catch (error) {
      this.logger.error("Error creating enquiry:", error.message, error.stack)

      if (error.name === "ValidationError") {
        throw new HttpException(
          {
            success: false,
            message: "Validation failed",
            errors: Object.keys(error.errors).map((key) => ({
              field: key,
              message: error.errors[key].message,
            })),
          },
          HttpStatus.BAD_REQUEST,
        )
      }

      throw new HttpException(
        {
          success: false,
          message: "Failed to create enquiry",
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    try {
      const pageNum = Number.parseInt(page, 10)
      const limitNum = Number.parseInt(limit, 10)

      const result = await this.enquiriesService.findAll({
        page: pageNum,
        limit: limitNum,
        status,
        search,
      })

      return {
        success: true,
        data: result.enquiries,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.total,
          totalPages: Math.ceil(result.total / limitNum),
        },
      }
    } catch (error) {
      this.logger.error("Error fetching enquiries:", error.message)
      throw new HttpException(
        {
          success: false,
          message: "Failed to fetch enquiries",
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const enquiry = await this.enquiriesService.findOne(id);
      
      if (!enquiry) {
        throw new HttpException(
          {
            success: false,
            message: 'Enquiry not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      
      return {
        success: true,
        data: enquiry,
      };
    } catch (error) {
      this.logger.error('Error fetching enquiry:', error.message);
      
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch enquiry',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(":id")
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      skipMissingProperties: true,
    }),
  )
  async update(@Param('id') id: string, updateEnquiryDto: UpdateEnquiryDto) {
    try {
      const enquiry = await this.enquiriesService.update(id, updateEnquiryDto)

      if (!enquiry) {
        throw new HttpException(
          {
            success: false,
            message: "Enquiry not found",
          },
          HttpStatus.NOT_FOUND,
        )
      }

      this.logger.log("Enquiry updated successfully", { id })

      return {
        success: true,
        message: "Enquiry updated successfully",
        data: enquiry,
      }
    } catch (error) {
      this.logger.error("Error updating enquiry:", error.message)

      if (error.status === HttpStatus.NOT_FOUND) {
        throw error
      }

      throw new HttpException(
        {
          success: false,
          message: "Failed to update enquiry",
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const result = await this.enquiriesService.remove(id);
      
      if (!result) {
        throw new HttpException(
          {
            success: false,
            message: 'Enquiry not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      
      this.logger.log('Enquiry deleted successfully', { id });
      
      return {
        success: true,
        message: 'Enquiry deleted successfully',
      };
    } catch (error) {
      this.logger.error('Error deleting enquiry:', error.message);
      
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete enquiry',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(":id/status")
  async updateStatus(@Param('id') id: string, body: { status: string; adminNotes?: string }) {
    try {
      const enquiry = await this.enquiriesService.updateStatus(id, body.status, body.adminNotes)

      if (!enquiry) {
        throw new HttpException(
          {
            success: false,
            message: "Enquiry not found",
          },
          HttpStatus.NOT_FOUND,
        )
      }

      this.logger.log("Enquiry status updated", { id, status: body.status })

      return {
        success: true,
        message: "Enquiry status updated successfully",
        data: enquiry,
      }
    } catch (error) {
      this.logger.error("Error updating enquiry status:", error.message)

      if (error.status === HttpStatus.NOT_FOUND) {
        throw error
      }

      throw new HttpException(
        {
          success: false,
          message: "Failed to update enquiry status",
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
