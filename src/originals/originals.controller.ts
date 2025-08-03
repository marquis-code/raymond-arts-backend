import { Controller, Get, Post, Patch, Param, Delete, HttpCode, HttpStatus, Body } from "@nestjs/common"
import { OriginalsService } from "./originals.service"
import { CreateOriginalDto } from "./dto/create-original.dto"
import { UpdateOriginalDto } from "./dto/update-original.dto"
import { ReorderOriginalsDto } from "./dto/reorder-original.dto" // Import the new DTO

@Controller("originals")
export class OriginalsController {
  constructor(private readonly originalsService: OriginalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOriginalDto: CreateOriginalDto) {
    // Removed @Body() decorator
    return this.originalsService.create(createOriginalDto)
  }

  @Get()
  findAll() {
    return this.originalsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.originalsService.findOne(id);
  }

  @Patch(":id")
  update(@Param('id') id: string, @Body() updateOriginalDto: UpdateOriginalDto) {
    // Removed @Body() decorator
    return this.originalsService.update(id, updateOriginalDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.originalsService.remove(id);
  }

  @Patch("reorder") // New endpoint for reordering
  @HttpCode(HttpStatus.OK)
  async reorder(@Body() reorderOriginalsDto: ReorderOriginalsDto) {
    await this.originalsService.updateOrder(reorderOriginalsDto.orderedOriginals)
    return { message: "Originals order updated successfully" }
  }
}
