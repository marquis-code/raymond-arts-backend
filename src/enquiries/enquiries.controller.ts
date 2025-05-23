import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    Patch,
  } from '@nestjs/common';
  import { EnquiriesService } from './enquiries.service';
  import { CreateEnquiryDto } from './dto/create-enquiry.dto';
  import { Enquiry } from './schemas/enquiry.schema';
  
  @Controller('enquiries')
  export class EnquiriesController {
    constructor(private readonly enquiriesService: EnquiriesService) {}
  
    @Post()
    async create(createEnquiryDto: CreateEnquiryDto): Promise<Enquiry> {
      return this.enquiriesService.create(createEnquiryDto);
    }
  
    @Get()
    async findAll(): Promise<Enquiry[]> {
      return this.enquiriesService.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Enquiry> {
      return this.enquiriesService.findOne(id);
    }
  
    @Put(':id')
    async update(
      @Param('id') id: string,
      @Body() updateData: Partial<Enquiry>,
    ): Promise<Enquiry> {
      return this.enquiriesService.update(id, updateData);
    }
  
    @Delete(':id')
    async remove(@Param('id') id: string): Promise<Enquiry> {
      return this.enquiriesService.remove(id);
    }
  
    @Patch(':id/resolve')
    async markAsResolved(@Param('id') id: string): Promise<Enquiry> {
      return this.enquiriesService.markAsResolved(id);
    }
  }