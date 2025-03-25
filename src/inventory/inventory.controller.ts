import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from "@nestjs/common"
import type { InventoryService } from "./inventory.service"
import type { CreateInventoryDto } from "./dto/create-inventory.dto"
import type { UpdateInventoryDto } from "./dto/update-inventory.dto"
import type { InventoryHistoryDto } from "./dto/inventory-history.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/enums/user-role.enum"
import type { PaginationDto } from "../common/dto/pagination.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger"

@ApiTags("Inventory")
@Controller("inventory")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create inventory item' })
  @ApiResponse({ status: 201, description: 'Inventory item created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.createInventoryItem(createInventoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory items' })
  @ApiResponse({ status: 200, description: 'Inventory items retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.inventoryService.findAll(paginationDto);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock items' })
  @ApiResponse({ status: 200, description: 'Low stock items retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  findLowStock(@Query('threshold') threshold?: number) {
    return this.inventoryService.findLowStock(threshold);
  }

  @Get("out-of-stock")
  @ApiOperation({ summary: "Get out of stock items" })
  @ApiResponse({ status: 200, description: "Out of stock items retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findOutOfStock() {
    return this.inventoryService.findOutOfStock()
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get inventory by product ID' })
  @ApiResponse({ status: 200, description: 'Inventory retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  findOne(@Param('productId') productId: string) {
    return this.inventoryService.findByProduct(productId);
  }

  @Patch(":productId")
  @ApiOperation({ summary: "Update inventory" })
  @ApiResponse({ status: 200, description: "Inventory updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Inventory not found" })
  @ApiParam({ name: "productId", description: "Product ID" })
  update(@Param('productId') productId: string, @Body() updateInventoryDto: UpdateInventoryDto, @Request() req) {
    return this.inventoryService.update(productId, updateInventoryDto, req.user.sub)
  }

  @Post(":productId/history")
  @ApiOperation({ summary: "Add inventory history entry" })
  @ApiResponse({ status: 201, description: "History entry added successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Inventory not found" })
  @ApiParam({ name: "productId", description: "Product ID" })
  addHistory(@Param('productId') productId: string, @Body() historyDto: InventoryHistoryDto, @Request() req) {
    return this.inventoryService.addToHistory(productId, historyDto, req.user.sub)
  }
}

