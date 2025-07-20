// import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common"
// import { Model, Types } from "mongoose"
// import { InjectModel } from "@nestjs/mongoose"
// import { Review, ReviewDocument, ReviewStatus, UserRole } from "./review.schema"
// import { CreateReviewDto } from "./dto/create-review.dto"
// import { ApproveReviewDto } from "./dto/approve-review.dto"
// import { ProductsService } from "../products/products.service"

// @Injectable()
// export class ReviewService {

//   constructor(
//     @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
//     private productService: ProductsService
//   ) {}


//   async findAllReviews(
//     page = 1,
//     limit = 10,
//   ): Promise<{
//     reviews: Review[],
//     total: number,
//     page: number,
//     totalPages: number,
//   }> {
//     const skip = (page - 1) * limit;
  
//     const [reviews, total] = await Promise.all([
//       this.reviewModel
//         .find()
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("course", "name") // optional, if populated
//         .exec(),
//       this.reviewModel.countDocuments(),
//     ]);
  
//     return {
//       reviews,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//     };
//   }
  

//   async create(
//     createReviewDto: CreateReviewDto,
//     userId: string,
//     userName: string,
//     userRole: UserRole,
//   ): Promise<Review> {
//     // Verify product exists
//     await this.productService.findOne(createReviewDto.productId)

//     // Check if user already reviewed this product
//     const existingReview = await this.reviewModel.findOne({
//       course: new Types.ObjectId(createReviewDto.productId), // Changed from productId to course
//       user: userId, // Changed from userId to user
//     })

//     if (existingReview) {
//       throw new BadRequestException("You have already reviewed this product")
//     }

//     // Set status based on user role
//     const status = userRole === UserRole.ADMIN ? ReviewStatus.APPROVED : ReviewStatus.PENDING

//     const review = new this.reviewModel({
//       ...createReviewDto,
//       course: new Types.ObjectId(createReviewDto.productId), // Changed from productId to course
//       user: userId, // Changed from userId to user
//       userName,
//       userRole,
//       status,
//     })

//     const savedReview = await review.save()

//     // If admin review or auto-approved, update product rating immediately
//     if (status === ReviewStatus.APPROVED) {
//       await this.updateProductRating(createReviewDto.productId)
//     }

//     return savedReview
//   }

//   // async findByProduct(
//   //   productId: string,
//   //   page = 1,
//   //   limit = 10,
//   //   includeAll = false,
//   // ): Promise<{
//   //   reviews: Review[]
//   //   total: number
//   //   page: number
//   //   totalPages: number
//   // }> {
//   //   if (!Types.ObjectId.isValid(productId)) {
//   //     throw new BadRequestException("Invalid product ID")
//   //   }

//   //   const skip = (page - 1) * limit
//   //   const filter: any = { course: new Types.ObjectId(productId) } // Changed from productId to course

//   //   if (!includeAll) {
//   //     filter.status = ReviewStatus.APPROVED
//   //   }

//   //   const [reviews, total] = await Promise.all([
//   //     this.reviewModel.find(filter)
//   //       .sort({ createdAt: -1 })
//   //       .skip(skip)
//   //       .limit(limit)
//   //       .exec(),
//   //     this.reviewModel.countDocuments(filter),
//   //   ])

//   //   return {
//   //     reviews,
//   //     total,
//   //     page,
//   //     totalPages: Math.ceil(total / limit),
//   //   }
//   // }

//   // async findByProduct(
//   //   productId: string,
//   //   page = 1,
//   //   limit = 10,
//   //   includeAll = false,
//   // ): Promise<{
//   //   reviews: Review[]
//   //   total: number
//   //   page: number
//   //   totalPages: number
//   // }> {
//   //   if (!Types.ObjectId.isValid(productId)) {
//   //     throw new BadRequestException("Invalid product ID");
//   //   }
  
//   //   const skip = (page - 1) * limit;
//   //   const filter: any = { course: new Types.ObjectId(productId) };
  
//   //   if (!includeAll) {
//   //     filter.status = ReviewStatus.APPROVED;
//   //   }
  
//   //   const [reviews, total] = await Promise.all([
//   //     this.reviewModel
//   //       .find(filter)
//   //       .sort({ createdAt: -1 })
//   //       .skip(skip)
//   //       .limit(limit)
//   //       .populate("course", "name") // Optional: populate course name
//   //       .exec(),
//   //     this.reviewModel.countDocuments(filter),
//   //   ]);
  
//   //   return {
//   //     reviews,
//   //     total,
//   //     page,
//   //     totalPages: Math.ceil(total / limit),
//   //   };
//   // }
  
//   async findByProduct(
//     productId: string,
//     page = 1,
//     limit = 10,
//     includeAll = false,
//   ): Promise<{
//     reviews: Review[],
//     total: number,
//     page: number,
//     totalPages: number,
//   }> {
//     if (!Types.ObjectId.isValid(productId)) {
//       throw new BadRequestException("Invalid product ID");
//     }
  
//     const skip = (page - 1) * limit;
//     const filter: any = { productId: new Types.ObjectId(productId) };
  
//     if (!includeAll) {
//       filter.status = ReviewStatus.APPROVED;
//     }
  
//     const [reviews, total] = await Promise.all([
//       this.reviewModel
//         .find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("productId", "name") // optional: populate product name
//         .exec(),
//       this.reviewModel.countDocuments(filter),
//     ]);
  
//     return {
//       reviews,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//     };
//   }
  

//   async findPendingReviews(
//     page = 1,
//     limit = 10,
//   ): Promise<{
//     reviews: Review[]
//     total: number
//     page: number
//     totalPages: number
//   }> {
//     const skip = (page - 1) * limit

//     const [reviews, total] = await Promise.all([
//       this.reviewModel
//         .find({ status: ReviewStatus.PENDING })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("course", "name") // Changed from productId to course
//         .exec(),
//       this.reviewModel.countDocuments({ status: ReviewStatus.PENDING }),
//     ])

//     return {
//       reviews,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//     }
//   }

//   async approveReview(reviewId: string, approveReviewDto: ApproveReviewDto, adminId: string): Promise<Review> {
//     if (!Types.ObjectId.isValid(reviewId)) {
//       throw new BadRequestException("Invalid review ID")
//     }

//     const review = await this.reviewModel.findById(reviewId)
//     if (!review) {
//       throw new NotFoundException("Review not found")
//     }

//     if (review.status !== ReviewStatus.PENDING) {
//       throw new BadRequestException("Review is not pending approval")
//     }

//     const updateData: any = {
//       status: approveReviewDto.status,
//       approvedBy: adminId,
//       approvedAt: new Date(),
//     }

//     if (approveReviewDto.status === ReviewStatus.REJECTED && approveReviewDto.rejectionReason) {
//       updateData.rejectionReason = approveReviewDto.rejectionReason
//     }

//     const updatedReview = await this.reviewModel.findByIdAndUpdate(reviewId, updateData, { new: true })

//     // Update product rating if approved
//     if (approveReviewDto.status === ReviewStatus.APPROVED) {
//       await this.updateProductRating(review.productId.toString())
//     }

//     return updatedReview
//   }

//   async findUserReviews(
//     userId: string,
//     page = 1,
//     limit = 10,
//   ): Promise<{
//     reviews: Review[]
//     total: number
//     page: number
//     totalPages: number
//   }> {
//     const skip = (page - 1) * limit

//     const [reviews, total] = await Promise.all([
//       this.reviewModel
//         .find({ userId })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("productId", "name")
//         .exec(),
//       this.reviewModel.countDocuments({ userId }),
//     ])

//     return {
//       reviews,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//     }
//   }

//   async deleteReview(reviewId: string, userId: string, userRole: UserRole): Promise<void> {
//     if (!Types.ObjectId.isValid(reviewId)) {
//       throw new BadRequestException("Invalid review ID");
//     }
  
//     const review = await this.reviewModel.findById(reviewId);
//     if (!review) {
//       throw new NotFoundException("Review not found");
//     }
  
//     // Users can only delete their own reviews, admins can delete any
//     if (userRole !== UserRole.ADMIN && review.userId !== userId) { // Changed from review.user to review.userId
//       throw new ForbiddenException("You can only delete your own reviews");
//     }
  
//     const wasApproved = review.status === ReviewStatus.APPROVED;
//     const productId = review.productId.toString(); // Changed from review.course to review.productId
  
//     await this.reviewModel.findByIdAndDelete(reviewId);
  
//     // Update product rating if the deleted review was approved
//     if (wasApproved) {
//       await this.updateProductRating(productId);
//     }
//   }

//   async getReviewStats(productId: string): Promise<{
//     totalReviews: number
//     averageRating: number
//     ratingDistribution: { [key: number]: number }
//   }> {
//     if (!Types.ObjectId.isValid(productId)) {
//       throw new BadRequestException("Invalid product ID")
//     }

//     const reviews = await this.reviewModel.find({
//       course: new Types.ObjectId(productId), // Changed from productId to course
//       status: ReviewStatus.APPROVED,
//     })

//     const totalReviews = reviews.length
//     const averageRating = totalReviews > 0 
//       ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
//       : 0

//     const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
//     reviews.forEach(review => {
//       ratingDistribution[review.rating]++
//     })

//     return {
//       totalReviews,
//       averageRating: Math.round(averageRating * 10) / 10,
//       ratingDistribution,
//     }
//   }


//   private async updateProductRating(productId: string): Promise<void> {
//     try {
//       const reviews = await this.reviewModel.find({
//         course: new Types.ObjectId(productId), // Changed from productId to course
//         status: ReviewStatus.APPROVED,
//       })

//       if (reviews.length === 0) {
//         await this.productService.updateRating(productId, 0, 0)
//         return
//       }

//       const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
//       const averageRating = totalRating / reviews.length

//       await this.productService.updateRating(productId, averageRating, reviews.length)
//     } catch (error) {
//       console.error(`Failed to update product rating for product ${productId}:`, error)
//       // Don't throw the error to avoid breaking the review creation/approval process
//     }
//   }
// }

import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common"
import { Model, Types } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"
import { ProductReview, ProductReviewDocument, ProductReviewStatus, UserRole } from "./review.schema"
import { CreateProductReviewDto } from "./dto/create-product-review.dto"
import { ApproveReviewDto } from "./dto/approve-review.dto"
import { ProductsService } from "../products/products.service"

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(ProductReview.name) private reviewModel: Model<ProductReviewDocument>,
    private productService: ProductsService
  ) {}

  // async create(
  //   createReviewDto: CreateReviewDto,
  //   userId: string,
  //   userName: string,
  //   userRole: UserRole,
  // ): Promise<Review> {
  //   // Verify product exists
  //   await this.productService.findOne(createReviewDto.productId)

  //   // Check if user already reviewed this product
  //   const existingReview = await this.reviewModel.findOne({
  //     productId: new Types.ObjectId(createReviewDto.productId),
  //     userId: userId,
  //   })

  //   if (existingReview) {
  //     throw new BadRequestException("You have already reviewed this product")
  //   }

  //   // Set status based on user role
  //   const status = userRole === UserRole.ADMIN ? ReviewStatus.APPROVED : ReviewStatus.PENDING

  //   const review = new this.reviewModel({
  //     productId: new Types.ObjectId(createReviewDto.productId),
  //     userId,
  //     userName,
  //     userRole,
  //     rating: createReviewDto.rating,
  //     comment: createReviewDto.comment,
  //     title: createReviewDto.title,
  //     status,
  //   })

  //   const savedReview = await review.save()

  //   // If admin review or auto-approved, update product rating immediately
  //   if (status === ReviewStatus.APPROVED) {
  //     await this.updateProductRating(createReviewDto.productId)
  //   }

  //   return savedReview
  // }

  async createReview(
    createReviewDto: CreateProductReviewDto,
    userId: string,
    userName: string,
    userRole: UserRole = UserRole.CUSTOMER
  ): Promise<ProductReview> {
    try {
      // Verify product exists
      const product = await this.productService.findOne(createReviewDto.productId)
      if (!product) {
        throw new NotFoundException('Product not found')
      }

      // Check if user already reviewed this product
      const existingReview = await this.reviewModel.findOne({
        productId: createReviewDto.productId,
        userId: userId,
      })

      if (existingReview) {
        throw new BadRequestException('You have already reviewed this product')
      }

      // Create review with all required fields
      const reviewData = {
        productId: new Types.ObjectId(createReviewDto.productId),
        userId: userId,
        userName: userName,
        userRole: userRole,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        title: createReviewDto.title,
        status: ProductReviewStatus.PENDING, // Default status
      }

      console.log("Review PAYLOAD", reviewData)
      const review = await this.reviewModel.create(reviewData)

      // Update product rating after creating review
      await this.updateProductRating(createReviewDto.productId)

      return review
    } catch (error) {
      console.error('Error creating review:', error)
      if (error.name === 'ValidationError') {
        throw new BadRequestException(`Validation error: ${error.message}`)
      }
      throw error
    }
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

  // async approveReview(
  //   reviewId: string, 
  //   approveReviewDto: ApproveReviewDto, 
  //   adminId: string
  // ): Promise<Review> {
  //   if (!Types.ObjectId.isValid(reviewId)) {
  //     throw new BadRequestException("Invalid review ID")
  //   }

  //   const review = await this.reviewModel.findById(reviewId)
  //   if (!review) {
  //     throw new NotFoundException("Review not found")
  //   }

  //   if (review.status !== ReviewStatus.PENDING) {
  //     throw new BadRequestException("Review is not pending approval")
  //   }

  //   const updateData: any = {
  //     status: approveReviewDto.status,
  //     approvedBy: adminId,
  //     approvedAt: new Date(),
  //   }

  //   if (approveReviewDto.status === ReviewStatus.REJECTED && approveReviewDto.rejectionReason) {
  //     updateData.rejectionReason = approveReviewDto.rejectionReason
  //   }

  //   const updatedReview = await this.reviewModel.findByIdAndUpdate(
  //     reviewId, 
  //     updateData, 
  //     { new: true }
  //   ).populate("productId", "name")

  //   // Update product rating if approved
  //   if (approveReviewDto.status === ReviewStatus.APPROVED) {
  //     await this.updateProductRating(review.productId.toString())
  //   }

  //   return updatedReview
  // }

  async approveReview(reviewId: string, approvedBy: string): Promise<ProductReview> {
    const review = await this.reviewModel.findById(reviewId)
    if (!review) {
      throw new NotFoundException('Review not found')
    }

    if (review.status === ProductReviewStatus.APPROVED) {
      throw new BadRequestException('Review is already approved')
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
      throw new NotFoundException('Review not found')
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

    return this.reviewModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec()
  }

  async updateReview(
    reviewId: string,
    updateData: Partial<CreateProductReviewDto>,
    userId: string
  ): Promise<ProductReview> {
    const review = await this.reviewModel.findById(reviewId)
    if (!review) {
      throw new NotFoundException('Review not found')
    }

    // Check if user owns this review
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews')
    }

    // Don't allow editing approved reviews
    if (review.status === ProductReviewStatus.APPROVED) {
      throw new BadRequestException('Cannot edit approved reviews')
    }

    // Update allowed fields
    if (updateData.rating !== undefined) review.rating = updateData.rating
    if (updateData.comment !== undefined) review.comment = updateData.comment
    if (updateData.title !== undefined) review.title = updateData.title

    // Reset to pending if it was rejected
    if (review.status === ProductReviewStatus.REJECTED) {
      review.status = ProductReviewStatus.PENDING
      review.rejectionReason = undefined
    }

    const updatedReview = await review.save()

    // Update product rating
    await this.updateProductRating(review.productId.toString())

    return updatedReview
  }

  async getUserReviews(userId: string): Promise<ProductReview[]> {
    return this.reviewModel
      .find({ userId })
      .populate('productId', 'name images')
      .sort({ createdAt: -1 })
      .exec()
  }

  // async deleteReview(reviewId: string, userId: string, userRole: UserRole): Promise<void> {
  //   if (!Types.ObjectId.isValid(reviewId)) {
  //     throw new BadRequestException("Invalid review ID")
  //   }

  //   const review = await this.reviewModel.findById(reviewId)
  //   if (!review) {
  //     throw new NotFoundException("Review not found")
  //   }

  //   // Users can only delete their own reviews, admins can delete any
  //   if (userRole !== UserRole.ADMIN && review.userId !== userId) {
  //     throw new ForbiddenException("You can only delete your own reviews")
  //   }

  //   const wasApproved = review.status === ReviewStatus.APPROVED
  //   const productId = review.productId.toString()

  //   await this.reviewModel.findByIdAndDelete(reviewId)

  //   // Update product rating if the deleted review was approved
  //   if (wasApproved) {
  //     await this.updateProductRating(productId)
  //   }
  // }

  // async getReviewStats(productId: string): Promise<{
  //   totalReviews: number
  //   averageRating: number
  //   ratingDistribution: { [key: number]: number }
  // }> {
  //   if (!Types.ObjectId.isValid(productId)) {
  //     throw new BadRequestException("Invalid product ID")
  //   }

  //   const reviews = await this.reviewModel.find({
  //     productId: new Types.ObjectId(productId),
  //     status: ReviewStatus.APPROVED,
  //   })

  //   const totalReviews = reviews.length
  //   const averageRating = totalReviews > 0 
  //     ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
  //     : 0

  //   const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  //   reviews.forEach(review => {
  //     ratingDistribution[review.rating]++
  //   })

  //   return {
  //     totalReviews,
  //     averageRating: Math.round(averageRating * 10) / 10,
  //     ratingDistribution,
  //   }
  // }

  // private async updateProductRating(productId: string): Promise<void> {
  //   try {
  //     const reviews = await this.reviewModel.find({
  //       productId: new Types.ObjectId(productId),
  //       status: ReviewStatus.APPROVED,
  //     })

  //     if (reviews.length === 0) {
  //       await this.productService.updateRating(productId, 0, 0)
  //       return
  //     }

  //     const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  //     const averageRating = totalRating / reviews.length

  //     await this.productService.updateRating(productId, averageRating, reviews.length)
  //   } catch (error) {
  //     console.error(`Failed to update product rating for product ${productId}:`, error)
  //     // Don't throw the error to avoid breaking the review creation/approval process
  //   }
  // }

  // Helper method to get review by ID
  async findOne(reviewId: string): Promise<ProductReview> {
    if (!Types.ObjectId.isValid(reviewId)) {
      throw new BadRequestException("Invalid review ID")
    }

    const review = await this.reviewModel
      .findById(reviewId)
      .populate("productId", "name images")
      .exec()

    if (!review) {
      throw new NotFoundException("Review not found")
    }

    return review
  }

  //Added

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.reviewModel.findById(reviewId)
    if (!review) {
      throw new NotFoundException('Review not found')
    }

    // Check if user owns this review
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews')
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
    const review = await this.reviewModel
      .findById(reviewId)
      .populate('productId', 'name images')
      .exec()

    if (!review) {
      throw new NotFoundException('Review not found')
    }

    return review
  }

  async getAllReviews(status?: ProductReviewStatus): Promise<ProductReview[]> {
    const query = status ? { status } : {}
    
    return this.reviewModel
      .find(query)
      .populate('productId', 'name images')
      .sort({ createdAt: -1 })
      .exec()
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

    const ratingDistribution = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1
      return acc
    }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
    }
  }
}