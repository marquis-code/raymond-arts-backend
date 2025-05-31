import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromoSaleService } from './promosale.service';
import { PromoSaleController } from './promosale.controller';
import { PromoSale, PromoSaleSchema } from './schemas/promosale.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PromoSale.name, schema: PromoSaleSchema }]),
  ],
  controllers: [PromoSaleController],
  providers: [PromoSaleService],
  exports: [PromoSaleService],
})
export class PromoSaleModule {}
