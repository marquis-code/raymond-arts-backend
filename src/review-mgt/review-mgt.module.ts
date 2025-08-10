import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewMgtService } from './review-mgt.service';
import { ReviewMgtController } from './review-mgt.controller';
import { ReviewMgt, ReviewMgtSchema } from './review-mgt.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ReviewMgt.name, schema: ReviewMgtSchema }]),
  ],
  controllers: [ReviewMgtController],
  providers: [ReviewMgtService],
  exports: [ReviewMgtService],
})
export class ReviewMgtModule {}