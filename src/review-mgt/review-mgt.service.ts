import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReviewMgt, ReviewMgtDocument } from './review-mgt.schema';
import { CreateReviewMgtDto } from './dto/create-review-mgt.dto';
import { UpdateReviewMgtDto } from './dto/update-review-mgt.dto';

@Injectable()
export class ReviewMgtService {
  constructor(
    @InjectModel(ReviewMgt.name) private reviewMgtModel: Model<ReviewMgtDocument>,
  ) {}

  async create(createReviewMgtDto: CreateReviewMgtDto): Promise<ReviewMgt> {
    const createdReview = new this.reviewMgtModel(createReviewMgtDto);
    return createdReview.save();
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{
    reviews: ReviewMgt[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.reviewMgtModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.reviewMgtModel.countDocuments().exec(),
    ]);

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ReviewMgt> {
    const review = await this.reviewMgtModel.findById(id).exec();
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }

  async findByProduct(productName: string): Promise<ReviewMgt[]> {
    return this.reviewMgtModel.find({ productName }).sort({ createdAt: -1 }).exec();
  }

  async findByCustomer(customerName: string): Promise<ReviewMgt[]> {
    return this.reviewMgtModel.find({ customerName }).sort({ createdAt: -1 }).exec();
  }

  async getProductRatingStats(productName: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const reviews = await this.reviewMgtModel.find({ productName }).exec();
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.starRating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.starRating] = (dist[review.starRating] || 0) + 1;
      return dist;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  }

  async update(id: string, updateReviewMgtDto: UpdateReviewMgtDto): Promise<ReviewMgt> {
    const updatedReview = await this.reviewMgtModel
      .findByIdAndUpdate(id, updateReviewMgtDto, { new: true })
      .exec();
    
    if (!updatedReview) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    
    return updatedReview;
  }

  async remove(id: string): Promise<void> {
    const result = await this.reviewMgtModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
  }

  async getReviewsByRating(starRating: number): Promise<ReviewMgt[]> {
    return this.reviewMgtModel.find({ starRating }).sort({ createdAt: -1 }).exec();
  }
}
