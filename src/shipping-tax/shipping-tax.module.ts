import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShippingTaxService } from './shipping-tax.service';
import { ShippingTaxController } from './shipping-tax.controller';
import { ShippingConfig, ShippingConfigSchema } from './schemas/shipping-config.schema';
import { TaxConfig, TaxConfigSchema } from './schemas/tax-config.schema';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShippingConfig.name, schema: ShippingConfigSchema },
      { name: TaxConfig.name, schema: TaxConfigSchema },
    ]),
    AuditModule,
  ],
  controllers: [ShippingTaxController],
  providers: [ShippingTaxService],
  exports: [ShippingTaxService],
})
export class ShippingTaxModule {}