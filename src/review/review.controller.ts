// import {
//     Controller,
//     Get,
//     Post,
//     Patch,
//     Param,
//     Delete,
//     Query,
//     UseGuards,
//     Request,
//     ParseIntPipe,
//     DefaultValuePipe,
//     Body
//   } from "@nestjs/common"
//   import { ReviewService } from "./review.service"
//   import { CreateReviewDto } from "../review/dto/create-review.dto"
//   import { ApproveReviewDto } from "../review/dto/approve-review.dto"
//   import { RolesGuard } from "../auth/guards/roles.guard"
//   import { Roles } from "../auth/decorators/roles.decorator"
//   import { UserRole } from "../users/enums/user-role.enum"
//   import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
//   import {
//     ApiBearerAuth
//   } from "@nestjs/swagger"

//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @ApiBearerAuth()
//   @Controller("reviews")
//   @UseGuards(RolesGuard)
//   export class ReviewController {
//     constructor(private readonly reviewService: ReviewService) {}
  
//     @Post()
//     create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
//       return this.reviewService.create(createReviewDto, req.user.sub, req.user.role, req.user.role)
//     }
  
//     @Get("product/:productId")
//     findByProduct(
//       @Param('productId') productId: string,         
//       @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
//       @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
//       @Query('includeAll') includeAll: string,
//       @Request() req,
//     ) {
//       const showAll = req.user?.role === UserRole.ADMIN && includeAll === "true"
//       return this.reviewService.findByProduct(productId, page, limit, showAll)
//     }
  
//     @Get("pending")
//     @Roles(UserRole.ADMIN)
//     findPendingReviews(
//       @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
//       @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
//     ) {
//       return this.reviewService.findPendingReviews(page, limit)
//     }
  
//     @Get("user/my-reviews")
//     @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
//     findUserReviews(
//       @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
//       @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
//       @Request() req,
//     ) {
//       return this.reviewService.findUserReviews(req.user.id, page, limit)
//     }
  
//     @Patch(":id/approve")
//     @Roles(UserRole.ADMIN)
//     approveReview(@Param('id') id: string, @Body() approveReviewDto: ApproveReviewDto, @Request() req) {
//       return this.reviewService.approveReview(id, approveReviewDto, req.user.id)
//     }
  
//     @Delete(":id")
//     @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
//     remove(@Param('id') id: string, @Request() req) {
//       return this.reviewService.deleteReview(id, req.user.id, req.user.role)
//     }
//   }
  

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  Body
} from "@nestjs/common"
import { ReviewService } from "./review.service"
import { CreateProductReviewDto } from "./dto/create-product-review.dto"
import { ApproveReviewDto } from "./dto/approve-review.dto"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole, ProductReview, ProductReviewStatus } from "./review.schema"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger"

// @ApiTags("Reviews")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller("reviews")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // @Post()
  // @ApiOperation({ summary: "Create a new review" })
  // @ApiResponse({ status: 201, description: "Review created successfully" })
  // @ApiResponse({ status: 400, description: "Bad request" })
  // create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
  //   return this.reviewService.createReview(
  //     createReviewDto, 
  //     req.user.sub, 
  //     req.user.name || req.user.username || `User-${req.user.sub}`, // Fallback for userName
  //     req.user.role
  //   )
  // }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review created successfully', type: ProductReview })
  async create(@Body() createReviewDto: CreateProductReviewDto, @Request() req): Promise<ProductReview> {
    // Extract user info from JWT token
    const userId = req.user.sub || req.user.id
    const userName = req.user.name || req.user.email || 'Anonymous'
    const userRole = req.user.role || UserRole.CUSTOMER

    return this.reviewService.createReview(createReviewDto, userId, userName, userRole)
  }


@Get()
@Roles(UserRole.ADMIN)
@ApiOperation({ summary: "Get all reviews (Admin only)" })
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
    @Param('productId') productId: string,         
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('includeAll') includeAll: string,
    @Request() req,
  ) {
    const showAll = req.user?.role === UserRole.ADMIN && includeAll === "true"
    console.log(productId, 'product id')
    return this.reviewService.findByProduct(productId, page, limit, showAll)
  }

  @Get("product/:productId/stats")
  @ApiOperation({ summary: "Get review statistics for a product" })
  @ApiResponse({ status: 200, description: "Review stats retrieved successfully" })
  @ApiParam({ name: "productId", description: "Product ID" })
  getReviewStats(@Param('productId') productId: string) {
    return this.reviewService.getReviewStats(productId)
  }

  @Get("pending")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Get pending reviews (Admin only)" })
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
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.STAFF)
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

  // @Patch(":id/approve")
  // @Roles(UserRole.ADMIN)
  // @ApiOperation({ summary: "Approve or reject a review (Admin only)" })
  // @ApiResponse({ status: 200, description: "Review status updated successfully" })
  // @ApiResponse({ status: 404, description: "Review not found" })
  // @ApiParam({ name: "id", description: "Review ID" })
  // approveReview(@Param('id') id: string, @Body() approveReviewDto: ApproveReviewDto, @Request() req) {
  //   return this.reviewService.approveReview(id, approveReviewDto, req.user.sub)
  // }

  // @Delete(":id")
  // @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.STAFF)
  // @ApiOperation({ summary: "Delete a review" })
  // @ApiResponse({ status: 200, description: "Review deleted successfully" })
  // @ApiResponse({ status: 403, description: "Forbidden - can only delete own reviews" })
  // @ApiResponse({ status: 404, description: "Review not found" })
  // @ApiParam({ name: "id", description: "Review ID" })
  // remove(@Param('id') id: string, @Request() req) {
  //   return this.reviewService.deleteReview(id, req.user.sub, req.user.role)
  // }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a review (admin only)' })
  @ApiResponse({ status: 200, description: 'Review rejected successfully', type: ProductReview })
  async reject(
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason: string,
  ): Promise<ProductReview> {
    return this.reviewService.rejectReview(id, rejectionReason)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  async remove(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    const userId = req.user.sub || req.user.id
    await this.reviewService.deleteReview(id, userId)
    return { message: 'Review deleted successfully' }
  }
}