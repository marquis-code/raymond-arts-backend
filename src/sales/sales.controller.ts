import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from "@nestjs/common"
import type { SalesService } from "./sales.service"
import type { CreateSaleDto } from "./dto/create-sale.dto"
import type { UpdateSaleDto } from "./dto/update-sale.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/enums/user-role.enum"
import type { PaginationDto } from "../common/dto/pagination.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger"

@ApiTags("Sales")
@Controller("sales")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new sale" })
  @ApiResponse({ status: 201, description: "Sale created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  create(@Body() createSaleDto: CreateSaleDto, @Request() req) {
    return this.salesService.create(createSaleDto, req.user.sub)
  }

  @Get()
  @ApiOperation({ summary: "Get all sales" })
  @ApiResponse({ status: 200, description: "Sales retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.salesService.findAll(paginationDto)
  }

  @Get("statistics")
  @ApiOperation({ summary: "Get sales statistics" })
  @ApiResponse({ status: 200, description: "Statistics retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getStatistics() {
    return this.salesService.getSalesStatistics()
  }

  @Get("top-products")
  @ApiOperation({ summary: "Get top selling products" })
  @ApiResponse({ status: 200, description: "Top products retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  getTopProducts(@Query("limit") limit: number) {
    return this.salesService.getTopSellingProducts(limit)
  }

  @Get("top-customers")
  @ApiOperation({ summary: "Get top customers" })
  @ApiResponse({ status: 200, description: "Top customers retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  getTopCustomers(@Query("limit") limit: number) {
    return this.salesService.getTopCustomers(limit)
  }

  @Get("customer/:customerId")
  @ApiOperation({ summary: "Get sales by customer" })
  @ApiResponse({ status: 200, description: "Sales retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiParam({ name: "customerId", description: "Customer ID" })
  findByCustomer(@Param("customerId") customerId: string, @Query() paginationDto: PaginationDto) {
    return this.salesService.findByCustomer(customerId, paginationDto)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a sale by ID" })
  @ApiResponse({ status: 200, description: "Sale retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Sale not found" })
  @ApiParam({ name: "id", description: "Sale ID" })
  findOne(@Param("id") id: string) {
    return this.salesService.findOne(id)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a sale" })
  @ApiResponse({ status: 200, description: "Sale updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Sale not found" })
  @ApiParam({ name: "id", description: "Sale ID" })
  update(@Param("id") id: string, @Body() updateSaleDto: UpdateSaleDto, @Request() req) {
    return this.salesService.update(id, updateSaleDto, req.user.sub)
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Delete a sale" })
  @ApiResponse({ status: 200, description: "Sale deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Sale not found" })
  @ApiParam({ name: "id", description: "Sale ID" })
  remove(@Param("id") id: string, @Request() req) {
    return this.salesService.remove(id, req.user.sub)
  }
}

