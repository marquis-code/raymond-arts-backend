import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  Body,
  Param,
} from "@nestjs/common"
import { ReviewService } from "./review.service"
import { CreateProductReviewDto } from "./dto/create-product-review.dto"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/enums/user-role.enum"
import { ProductReview, type ProductReviewStatus } from "./review.schema"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"

@Controller("reviews")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update review status (admin/staff only)" })
  @ApiResponse({ status: 200, description: "Review status updated successfully" })
  @ApiResponse({ status: 404, description: "Review not found" })
  async updateReviewStatus(
    @Param('id') id: string, 
    @Body('status') status: ProductReviewStatus, 
    @Request() req
  ): Promise<{ message: string }> {
    const userId = req.user.sub || req.user.id
    await this.reviewService.updateReviewStatus(id, status, userId)
    return { message: "Review status updated successfully" }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new review (productId or productName required)' })
  @ApiResponse({ status: 201, description: 'Review created successfully', type: ProductReview })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed or missing productId/productName' })
  @ApiResponse({ status: 404, description: 'Not Found - Product not found if productId was provided' })
  async create(@Body() createReviewDto: CreateProductReviewDto): Promise<ProductReview> {
    return this.reviewService.createReview(createReviewDto)
  }

  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.STAFF)
  // @ApiBearerAuth()
  @ApiOperation({ summary: "Get all reviews (Admin/Staff only)" })
  @ApiResponse({ status: 200, description: "All reviews retrieved successfully" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  getAllReviews(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    // This endpoint will return all reviews, including those with only a productName
    return this.reviewService.findAllReviews(page, limit)
  }

  @Get("product/:productId")
  @ApiOperation({ summary: "Get reviews for a specific product ID" })
  @ApiResponse({ status: 200, description: "Reviews retrieved successfully" })
  @ApiParam({ name: "productId", description: "Product ID" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "includeAll", required: false, type: String, description: "Set to 'true' to include pending/rejected reviews (Admin/Staff only)" })
  findByProduct(
    @Param('productId') productId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('includeAll') includeAll: string,
    @Request() req,
  ) {
    // This endpoint will ONLY return reviews linked by productId
    // Reviews created with only productName will NOT appear here.
    // const showAll = req.user?.role === UserRole.ADMIN && includeAll === "true"
    const showAll = true
    console.log(productId, "product id")
    return this.reviewService.findByProduct(productId, page, limit, showAll)
  }

  @Get("product/:productId/stats")
  @ApiOperation({ summary: "Get review statistics for a specific product ID" })
  @ApiResponse({ status: 200, description: "Review stats retrieved successfully" })
  @ApiParam({ name: "productId", description: "Product ID" })
  getReviewStats(@Param('productId') productId: string) {
    // This endpoint will ONLY calculate stats for reviews linked by productId
    return this.reviewService.getReviewStats(productId)
  }

  @Get("pending")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get pending reviews (Admin/Staff only)" })
  @ApiResponse({ status: 200, description: "Pending reviews retrieved successfully" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  findPendingReviews(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    // This endpoint will return all pending reviews, regardless of productId or productName
    return this.reviewService.findPendingReviews(page, limit)
  }

  @Get("user/my-reviews")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's reviews" })
  @ApiResponse({ status: 200, description: "User reviews retrieved successfully" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  findUserReviews(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Request() req,
  ) {
    return this.reviewService.findUserReviews(req.user.sub, page, limit)
  }

  @Patch(":id/reject")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Reject a review (admin/staff only)" })
  @ApiResponse({ status: 200, description: "Review rejected successfully", type: ProductReview })
  async reject(@Param('id') id: string, @Body('rejectionReason') rejectionReason: string): Promise<ProductReview> {
    return this.reviewService.rejectReview(id, rejectionReason)
  }

  @Patch(":id/approve")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Approve a review (admin/staff only)" })
  @ApiResponse({ status: 200, description: "Review approved successfully", type: ProductReview })
  async approve(@Param('id') id: string, @Request() req): Promise<any> {
    console.log(req.user, 'user here')
    const userId = req.user.sub || req.user.id
    return this.reviewService.approveReview(id, userId)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a review (admin/staff only)" })
  @ApiResponse({ status: 200, description: "Review deleted successfully" })
  async remove(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    const userId = req.user.sub || req.user.id
    await this.reviewService.deleteReview(id, userId)
    return { message: "Review deleted successfully" }
  }
}