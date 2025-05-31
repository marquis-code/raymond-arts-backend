import { PartialType } from '@nestjs/swagger';
import { CreatePromoSaleDto } from './create-promosale.dto';

export class UpdatePromoSaleDto extends PartialType(CreatePromoSaleDto) {}