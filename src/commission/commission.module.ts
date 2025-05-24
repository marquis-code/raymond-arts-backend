// src/commission.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { CommissionRequestService } from './commission-request.service';
import { DrawingTypeService } from './drawing-type.service';
import { CommissionRequestController } from './commission-request.controller';
import { DrawingTypeController } from './drawing-type.controller';
import { CommissionRequest, CommissionRequestSchema } from './schemas/commission-request.schema';
import { DrawingType, DrawingTypeSchema } from './schemas/drawing-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommissionRequest.name, schema: CommissionRequestSchema },
      { name: DrawingType.name, schema: DrawingTypeSchema },
    ]),
    MulterModule.register({
      dest: './uploads/commissions',
      limits: {
        fileSize: 15 * 1024 * 1024, // 15MB max file size
        files: 5, // Max 5 files
      },
    }),
  ],
  controllers: [CommissionRequestController, DrawingTypeController],
  providers: [CommissionRequestService, DrawingTypeService],
  exports: [CommissionRequestService, DrawingTypeService],
})
export class CommissionModule {}