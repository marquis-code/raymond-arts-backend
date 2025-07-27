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
  async updateReviewStatus(id: string, status: ProductReviewStatus, req): Promise<{ message: string }> {
    const userId = req.user.sub || req.user.id
    await this.reviewService.updateReviewStatus(id, status, userId)
    return { message: "Review status updated successfully" }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new review (no authentication required)' })
  @ApiResponse({ status: 201, description: 'Review created successfully', type: ProductReview })
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
    return this.reviewService.findAllReviews(page, limit)
  }

  @Get("product/:productId")
  @ApiOperation({ summary: "Get reviews for a product" })
  @ApiResponse({ status: 200, description: "Reviews retrieved successfully" })
  @ApiParam({ name: "productId", description: "Product ID" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "includeAll", required: false, type: String })
  findByProduct(
    productId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    includeAll: string,
    @Request() req,
  ) {
    // Check if user is admin and wants to see all reviews
    const showAll = req.user?.role === UserRole.ADMIN && includeAll === "true"
    console.log(productId, "product id")
    return this.reviewService.findByProduct(productId, page, limit, showAll)
  }

  @Get("product/:productId/stats")
  @ApiOperation({ summary: "Get review statistics for a product" })
  @ApiResponse({ status: 200, description: "Review stats retrieved successfully" })
  @ApiParam({ name: "productId", description: "Product ID" })
  getReviewStats(productId: string) {
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
  async reject(id: string, rejectionReason: string): Promise<ProductReview> {
    return this.reviewService.rejectReview(id, rejectionReason)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a review (admin/staff only)" })
  @ApiResponse({ status: 200, description: "Review deleted successfully" })
  async remove(id: string, @Request() req): Promise<{ message: string }> {
    const userId = req.user.sub || req.user.id
    await this.reviewService.deleteReview(id, userId)
    return { message: "Review deleted successfully" }
  }
}
