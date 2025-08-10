import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ValidationPipe,
    UsePipes,
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
  import { ReviewMgtService } from './review-mgt.service';
  import { CreateReviewMgtDto } from './dto/create-review-mgt.dto';
  import { UpdateReviewMgtDto } from './dto/update-review-mgt.dto';
  
  @ApiTags('review-management')
  @Controller('review-mgt')
  @UsePipes(new ValidationPipe())
  export class ReviewMgtController {
    constructor(private readonly reviewMgtService: ReviewMgtService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new review' })
    @ApiResponse({ status: 201, description: 'Review created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    create(@Body() createReviewMgtDto: CreateReviewMgtDto) {
      return this.reviewMgtService.create(createReviewMgtDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all reviews with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
    @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
    findAll(
      @Query('page') page?: number,
      @Query('limit') limit?: number,
    ) {
      return this.reviewMgtService.findAll(page, limit);
    }
  
    @Get('product/:productName')
    @ApiOperation({ summary: 'Get reviews by product name' })
    @ApiResponse({ status: 200, description: 'Product reviews retrieved successfully' })
    findByProduct(@Param('productName') productName: string) {
      return this.reviewMgtService.findByProduct(productName);
    }
  
    @Get('customer/:customerName')
    @ApiOperation({ summary: 'Get reviews by customer name' })
    @ApiResponse({ status: 200, description: 'Customer reviews retrieved successfully' })
    findByCustomer(@Param('customerName') customerName: string) {
      return this.reviewMgtService.findByCustomer(customerName);
    }
  
    @Get('product/:productName/stats')
    @ApiOperation({ summary: 'Get rating statistics for a product' })
    @ApiResponse({ status: 200, description: 'Product rating stats retrieved successfully' })
    getProductRatingStats(@Param('productName') productName: string) {
      return this.reviewMgtService.getProductRatingStats(productName);
    }
  
    @Get('rating/:starRating')
    @ApiOperation({ summary: 'Get reviews by star rating' })
    @ApiResponse({ status: 200, description: 'Reviews by rating retrieved successfully' })
    getReviewsByRating(@Param('starRating') starRating: number) {
      return this.reviewMgtService.getReviewsByRating(+starRating);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get a review by ID' })
    @ApiResponse({ status: 200, description: 'Review retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    findOne(@Param('id') id: string) {
      return this.reviewMgtService.findOne(id);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update a review' })
    @ApiResponse({ status: 200, description: 'Review updated successfully' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    update(@Param('id') id: string, @Body() updateReviewMgtDto: UpdateReviewMgtDto) {
      return this.reviewMgtService.update(id, updateReviewMgtDto);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a review' })
    @ApiResponse({ status: 200, description: 'Review deleted successfully' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    remove(@Param('id') id: string) {
      return this.reviewMgtService.remove(id);
    }
  }
  