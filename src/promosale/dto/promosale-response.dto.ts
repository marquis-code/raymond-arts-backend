import { ApiProperty } from '@nestjs/swagger';
import { PromoSaleStatus } from '../schemas/promosale.schema';

export class PromoSaleResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  actionText: string;

  @ApiProperty()
  discountPercentage: number;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty({ enum: PromoSaleStatus })
  status: PromoSaleStatus;

  @ApiProperty()
  isLifetime: boolean;

  @ApiProperty()
  priority: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}