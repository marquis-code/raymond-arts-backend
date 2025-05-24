import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DrawingTypeService } from './drawing-type.service';
import { CreateDrawingTypeDto } from './dto/create-drawing-type.dto';
import { UpdateDrawingTypeDto } from './dto/update-drawing-type.dto';

@Controller('drawing-types')
export class DrawingTypeController {
  constructor(private readonly drawingTypeService: DrawingTypeService) {}

  @Post()
  // @UseGuards(AdminGuard) // Uncomment if you have admin authentication
  create(@Body() createDrawingTypeDto: CreateDrawingTypeDto) {
    return this.drawingTypeService.create(createDrawingTypeDto);
  }

  @Get()
  findAll() {
    return this.drawingTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.drawingTypeService.findOne(id);
  }

  @Patch(':id')
  // @UseGuards(AdminGuard) // Uncomment if you have admin authentication
  update(@Param('id') id: string, @Body() updateDrawingTypeDto: UpdateDrawingTypeDto) {
    return this.drawingTypeService.update(id, updateDrawingTypeDto);
  }

  @Delete(':id')
  // @UseGuards(AdminGuard) // Uncomment if you have admin authentication
  remove(@Param('id') id: string) {
    return this.drawingTypeService.remove(id);
  }

  @Post('seed')
  // @UseGuards(AdminGuard) // Uncomment if you have admin authentication
  seed() {
    return this.drawingTypeService.seedDefaultTypes();
  }
}

