import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ShippingTaxService } from './shipping-tax.service';
import { CreateShippingConfigDto } from './dto/create-shipping-config.dto';
import { CreateTaxConfigDto } from './dto/create-tax-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@ApiTags('Shipping & Tax')
@Controller('shipping-tax')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ShippingTaxController {
  constructor(private readonly shippingTaxService: ShippingTaxService) {}

  @Post('shipping')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create shipping configuration' })
  createShippingConfig(@Body() createShippingConfigDto: CreateShippingConfigDto, @Req() req) {
    return this.shippingTaxService.createShippingConfig(createShippingConfigDto, req.user.id);
  }

  @Post('tax')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create tax configuration' })
  createTaxConfig(@Body() createTaxConfigDto: CreateTaxConfigDto, @Req() req) {
    return this.shippingTaxService.createTaxConfig(createTaxConfigDto, req.user.id);
  }

  @Get('shipping')
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all shipping configurations' })
  getAllShippingConfigs() {
    return this.shippingTaxService.getAllShippingConfigs();
  }

  @Get('tax')
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all tax configurations' })
  getAllTaxConfigs() {
    return this.shippingTaxService.getAllTaxConfigs();
  }

  @Patch('shipping/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update shipping configuration' })
  updateShippingConfig(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateShippingConfigDto>,
    @Req() req,
  ) {
    return this.shippingTaxService.updateShippingConfig(id, updateData, req.user.id);
  }

  @Patch('tax/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update tax configuration' })
  updateTaxConfig(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateTaxConfigDto>,
    @Req() req,
  ) {
    return this.shippingTaxService.updateTaxConfig(id, updateData, req.user.id);
  }

  @Delete('shipping/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete shipping configuration' })
  deleteShippingConfig(@Param('id') id: string, @Req() req) {
    return this.shippingTaxService.deleteShippingConfig(id, req.user.id);
  }

  @Delete('tax/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete tax configuration' })
  deleteTaxConfig(@Param('id') id: string, @Req() req) {
    return this.shippingTaxService.deleteTaxConfig(id, req.user.id);
  }
}