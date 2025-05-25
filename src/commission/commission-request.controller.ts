// src/controllers/commission-request.controller.ts
import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    Query, 
    ParseIntPipe,
    DefaultValuePipe,
    UseInterceptors,
    UploadedFiles,
  } from '@nestjs/common';
  import { FilesInterceptor } from '@nestjs/platform-express';
  import { CommissionRequestService } from './commission-request.service';
  import { CreateCommissionRequestDto } from './dto/create-commission-request.dto';
  import { UpdateCommissionRequestDto } from './dto/update-commission-request.dto';
  
  @Controller('commission-requests')
  export class CommissionRequestController {
    constructor(private readonly commissionRequestService: CommissionRequestService) {}
  
    @Post()
    @UseInterceptors(FilesInterceptor('referencePhotos', 5)) // Max 5 files
    @Post()
    async create(@Body() createCommissionRequestDto: CreateCommissionRequestDto) {
      return this.commissionRequestService.create(createCommissionRequestDto);
    }
  
    @Get()
    findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
      return this.commissionRequestService.findAll(page, limit);
    }
  
    @Get('status/:status')
    findByStatus(@Param('status') status: string) {
      return this.commissionRequestService.findByStatus(status);
    }
  
    @Get('email/:email')
    findByEmail(@Param('email') email: string) {
      return this.commissionRequestService.findByEmail(email);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.commissionRequestService.findOne(id);
    }
  
    @Patch(':id')
    // @UseGuards(AdminGuard) // Uncomment if you have admin authentication
    update(@Param('id') id: string, @Body() updateCommissionRequestDto: UpdateCommissionRequestDto) {
      return this.commissionRequestService.update(id, updateCommissionRequestDto);
    }
  
    @Delete(':id')
    // @UseGuards(AdminGuard) // Uncomment if you have admin authentication
    remove(@Param('id') id: string) {
      return this.commissionRequestService.remove(id);
    }
  
    private async storeFiles(files: Express.Multer.File[]): Promise<string[]> {
      // Implement your file storage logic here
      // This could be local storage, AWS S3, Cloudinary, etc.
      // For now, returning dummy URLs
      return files.map((file, index) => `/uploads/commissions/${Date.now()}_${index}_${file.originalname}`);
    }
  }
  