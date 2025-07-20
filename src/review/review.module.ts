import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ReviewService } from "./review.service"
import { ReviewController } from "./review.controller"
import { ProductReview, ProductReviewSchema } from "./review.schema"
import { ProductsModule } from "../products/products.module"

@Module({
  imports: [MongooseModule.forFeature([{ name: ProductReview.name, schema: ProductReviewSchema }]), ProductsModule],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
