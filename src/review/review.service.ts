import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { ProductReview, ProductReviewDocument, ProductReviewStatus, UserRole } from "./review.schema"
import { CreateProductReviewDto } from "./dto/create-product-review.dto"
import { ProductsService } from "../products/products.service"

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(ProductReview.name) private reviewModel: Model<ProductReviewDocument>,
    private productService: ProductsService,
  ) {}

  async createReview(createReviewDto: CreateProductReviewDto): Promise<ProductReview> {
    try {
      // Verify product exists
      const product = await this.productService.findOne(createReviewDto.productId)
      if (!product) {
        throw new NotFoundException("Product not found")
      }

      // Check if email already reviewed this product (prevent spam)
      const existingReview = await this.reviewModel.findOne({
        productId: createReviewDto.productId,
        email: createReviewDto.email.toLowerCase(),
      })

      if (existingReview) {
        throw new BadRequestException("This email has already reviewed this product")
      }

      // Create review with all required fields
      const reviewData = {
        productId: new Types.ObjectId(createReviewDto.productId),
        userId: undefined, // No user ID for anonymous reviews
        userName: createReviewDto.userName || "Anonymous",
        email: createReviewDto.email.toLowerCase(),
        userRole: UserRole.ANONYMOUS,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        title: createReviewDto.title,
        imageUrls: createReviewDto.imageUrls || [],
        status: ProductReviewStatus.PENDING, // All reviews start as pending
      }

      console.log("Review PAYLOAD", reviewData)
      const review = await this.reviewModel.create(reviewData)

      // Note: Don't update product rating here since review is pending approval
      return review
    } catch (error) {
      console.error("Error creating review:", error)
      if (error.name === "ValidationError") {
        throw new BadRequestException(`Validation error: ${error.message}`)
      }
      throw error
    }
  }

  async updateReviewStatus(reviewId: string, status: ProductReviewStatus, userId: string): Promise<ProductReview> {
    const review = await this.reviewModel.findById(reviewId)
    if (!review) {
      throw new NotFoundException("Review not found")
    }

    // Prevent changing approved reviews status to other values
    if (review.status === ProductReviewStatus.APPROVED && status !== ProductReviewStatus.APPROVED) {
      throw new BadRequestException("Approved reviews cannot be updated to other statuses")
    }

    const previousStatus = review.status
    review.status = status

    // If status is approved, update the approved fields
    if (status === ProductReviewStatus.APPROVED) {
      review.approvedAt = new Date()
      review.approvedBy = userId
    }

    if (status === ProductReviewStatus.REJECTED) {
      review.rejectionReason = "Rejected by admin or staff"
    }

    const updatedReview = await review.save()

    // Update product rating when status changes
    if (status === ProductReviewStatus.APPROVED || previousStatus === ProductReviewStatus.APPROVED) {
      await this.updateProductRating(review.productId.toString())
    }

    return updatedReview
  }

  async findAllReviews(
    page = 1,
    limit = 10,
  ): Promise<{
    reviews: ProductReview[]
    total: number
    page: number
    totalPages: number
  }> {
    const skip = (page - 1) * limit
    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("productId", "name images price")
        .exec(),
      this.reviewModel.countDocuments(),
    ])

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findByProduct(
    productId: string,
    page = 1,
    limit = 10,
    includeAll = false,
  ): Promise<{
    reviews: ProductReview[]
    total: number
    page: number
    totalPages: number
    averageRating: number
    ratingDistribution: { [key: number]: number }
  }> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException("Invalid product ID")
    }

    const skip = (page - 1) * limit
    const filter: any = { productId: new Types.ObjectId(productId) }

    if (!includeAll) {
      filter.status = ProductReviewStatus.APPROVED
    }

    const [reviews, total, stats] = await Promise.all([
      this.reviewModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("productId", "name")
        .exec(),
      this.reviewModel.countDocuments(filter),
      this.getReviewStats(productId),
    ])

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      averageRating: stats.averageRating,
      ratingDistribution: stats.ratingDistribution,
    }
  }

  async findPendingReviews(
    page = 1,
    limit = 10,
  ): Promise<{
    reviews: ProductReview[]
    total: number
    page: number
    totalPages: number
  }> {
    const skip = (page - 1) * limit
    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find({ status: ProductReviewStatus.PENDING })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("productId", "name images")
        .exec(),
      this.reviewModel.countDocuments({ status: ProductReviewStatus.PENDING }),
    ])

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findUserReviews(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    reviews: ProductReview[]
    total: number
    page: number
    totalPages: number
  }> {
    const skip = (page - 1) * limit
    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("productId", "name images price")
        .exec(),
      this.reviewModel.countDocuments({ userId }),
    ])

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async approveReview(reviewId: string, approvedBy: string): Promise<ProductReview> {
    const review = await this.reviewModel.findById(reviewId)
    if (!review) {
      throw new NotFoundException("Review not found")
    }

    if (review.status === ProductReviewStatus.APPROVED) {
      throw new BadRequestException("Review is already approved")
    }

    review.status = ProductReviewStatus.APPROVED
    review.approvedBy = approvedBy
    review.approvedAt = new Date()

    const updatedReview = await review.save()

    // Update product rating after approval
    await this.updateProductRating(review.productId.toString())
    await this.productService.incrementApprovedReviews(review.productId.toString())

    return updatedReview
  }

  async rejectReview(reviewId: string, rejectionReason: string): Promise<ProductReview> {
    const review = await this.reviewModel.findById(reviewId)
    if (!review) {
      throw new NotFoundException("Review not found")
    }

    const wasApproved = review.status === ProductReviewStatus.APPROVED

    review.status = ProductReviewStatus.REJECTED
    review.rejectionReason = rejectionReason

    const updatedReview = await review.save()

    // If review was previously approved, update product stats
    if (wasApproved) {
      await this.updateProductRating(review.productId.toString())
      await this.productService.decrementApprovedReviews(review.productId.toString())
    }

    return updatedReview
  }

  async getProductReviews(productId: string, status?: ProductReviewStatus): Promise<ProductReview[]> {
    const query: any = { productId: new Types.ObjectId(productId) }
    if (status) {
      query.status = status
    } else {
      // By default, only return approved reviews for public viewing
      query.status = ProductReviewStatus.APPROVED
    }

    return this.reviewModel.find(query).sort({ createdAt: -1 }).exec()
  }

  async updateReview(
    reviewId: string,
    updateData: Partial<CreateProductReviewDto>,
    userId: string,
  ): Promise<ProductReview> {
    const review = await this.reviewModel.findById(reviewId)
    if (!review) {
      throw new NotFoundException("Review not found")
    }

    // Check if user owns this review (only for authenticated users)
    if (review.userId && review.userId !== userId) {
      throw new ForbiddenException("You can only edit your own reviews")
    }

    // Don't allow editing approved reviews
    if (review.status === ProductReviewStatus.APPROVED) {
      throw new BadRequestException("Cannot edit approved reviews")
    }

    // Update allowed fields
    if (updateData.rating !== undefined) review.rating = updateData.rating
    if (updateData.comment !== undefined) review.comment = updateData.comment
    if (updateData.title !== undefined) review.title = updateData.title
    if (updateData.imageUrls !== undefined) review.imageUrls = updateData.imageUrls

    // Reset to pending if it was rejected
    if (review.status === ProductReviewStatus.REJECTED) {
      review.status = ProductReviewStatus.PENDING
      review.rejectionReason = undefined
    }

    const updatedReview = await review.save()

    // No need to update product rating here since:
    // 1. We don't allow editing approved reviews (early return above)
    // 2. Pending/rejected reviews don't affect product ratings
    // 3. Product rating will be updated when/if the review gets approved later

    return updatedReview
  }

  async getUserReviews(userId: string): Promise<ProductReview[]> {
    return this.reviewModel.find({ userId }).populate("productId", "name images").sort({ createdAt: -1 }).exec()
  }

  // Helper method to get review by ID
  async findOne(reviewId: string): Promise<ProductReview> {
    if (!Types.ObjectId.isValid(reviewId)) {
      throw new BadRequestException("Invalid review ID")
    }

    const review = await this.reviewModel.findById(reviewId).populate("productId", "name images").exec()

    if (!review) {
      throw new NotFoundException("Review not found")
    }

    return review
  }

  // Updated delete method - only admins can delete reviews now
  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.reviewModel.findById(reviewId)
    if (!review) {
      throw new NotFoundException("Review not found")
    }

    const wasApproved = review.status === ProductReviewStatus.APPROVED
    await this.reviewModel.findByIdAndDelete(reviewId)

    // Update product stats if review was approved
    if (wasApproved) {
      await this.updateProductRating(review.productId.toString())
      await this.productService.decrementApprovedReviews(review.productId.toString())
    }
  }

  private async updateProductRating(productId: string): Promise<void> {
    try {
      const reviews = await this.reviewModel.find({
        productId: new Types.ObjectId(productId),
        status: ProductReviewStatus.APPROVED,
      })

      if (reviews.length === 0) {
        await this.productService.updateRating(productId, 0, 0)
        return
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / reviews.length

      await this.productService.updateRating(productId, averageRating, reviews.length)
    } catch (error) {
      console.error(`Failed to update product rating for ${productId}:`, error)
      // Don't throw here to avoid breaking the main operation
    }
  }

  async getReviewById(reviewId: string): Promise<ProductReview> {
    const review = await this.reviewModel.findById(reviewId).populate("productId", "name images").exec()

    if (!review) {
      throw new NotFoundException("Review not found")
    }

    return review
  }

  async getAllReviews(status?: ProductReviewStatus): Promise<ProductReview[]> {
    const query = status ? { status } : {}
    return this.reviewModel.find(query).populate("productId", "name images").sort({ createdAt: -1 }).exec()
  }

  async getReviewStats(productId: string): Promise<any> {
    const reviews = await this.reviewModel.find({
      productId: new Types.ObjectId(productId),
      status: ProductReviewStatus.APPROVED,
    })

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      }
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    const ratingDistribution = reviews.reduce(
      (acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1
        return acc
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    )

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
    }
  }
}
