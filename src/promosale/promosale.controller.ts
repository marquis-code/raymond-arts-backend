import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
  } from '@nestjs/swagger';
  import { PromoSaleService } from './promosale.service';
  import { CreatePromoSaleDto } from './dto/create-promosale.dto';
  import { UpdatePromoSaleDto } from './dto/update-promosale.dto';
  import { PromoSaleResponseDto } from './dto/promosale-response.dto';
  
  // @ApiTags('promosales')
  @Controller('promosales')
  export class PromoSaleController {
    constructor(private readonly promoSaleService: PromoSaleService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new promotional sale' })
    @ApiResponse({
      status: 201,
      description: 'The promo sale has been successfully created.',
      type: PromoSaleResponseDto,
    })
    @ApiResponse({ status: 409, description: 'Conflicting promo sale exists.' })
    create(@Body() createPromoSaleDto: CreatePromoSaleDto) {
      return this.promoSaleService.create(createPromoSaleDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all promotional sales' })
    @ApiResponse({
      status: 200,
      description: 'List of all promo sales.',
      type: [PromoSaleResponseDto],
    })
    findAll() {
      return this.promoSaleService.findAll();
    }
  
    @Get('active')
    @ApiOperation({ 
      summary: 'Get the currently active promotional sale',
      description: 'Returns only promos that are currently active and within their valid date/time range'
    })
    @ApiResponse({
      status: 200,
      description: 'The currently active promo sale (only if one is running now).',
      type: PromoSaleResponseDto,
    })
    @ApiResponse({
      status: 200,
      description: 'No active promo sale found.',
      schema: { type: 'null' }
    })
    async findActive() {
      const activePromo = await this.promoSaleService.findActive();
      return activePromo; // Will return null if no active promo
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get a promotional sale by ID' })
    @ApiParam({ name: 'id', description: 'Promo sale ID' })
    @ApiResponse({
      status: 200,
      description: 'The promo sale details.',
      type: PromoSaleResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Promo sale not found.' })
    findOne(@Param('id') id: string) {
      return this.promoSaleService.findOne(id);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update a promotional sale' })
    @ApiParam({ name: 'id', description: 'Promo sale ID' })
    @ApiResponse({
      status: 200,
      description: 'The promo sale has been successfully updated.',
      type: PromoSaleResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Promo sale not found.' })
    update(@Param('id') id: string, @Body() updatePromoSaleDto: UpdatePromoSaleDto) {
      return this.promoSaleService.update(id, updatePromoSaleDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a promotional sale' })
    @ApiParam({ name: 'id', description: 'Promo sale ID' })
    @ApiResponse({ status: 204, description: 'The promo sale has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Promo sale not found.' })
    remove(@Param('id') id: string) {
      return this.promoSaleService.remove(id);
    }
  
    @Patch(':id/activate')
    @ApiOperation({ summary: 'Manually activate a promotional sale' })
    @ApiParam({ name: 'id', description: 'Promo sale ID' })
    @ApiResponse({
      status: 200,
      description: 'The promo sale has been activated.',
      type: PromoSaleResponseDto,
    })
    activate(@Param('id') id: string) {
      return this.promoSaleService.activatePromo(id);
    }
  
    @Patch(':id/deactivate')
    @ApiOperation({ summary: 'Manually deactivate a promotional sale' })
    @ApiParam({ name: 'id', description: 'Promo sale ID' })
    @ApiResponse({
      status: 200,
      description: 'The promo sale has been deactivated.',
      type: PromoSaleResponseDto,
    })
    deactivate(@Param('id') id: string) {
      return this.promoSaleService.deactivatePromo(id);
    }
  }
  