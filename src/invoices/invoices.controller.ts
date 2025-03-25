import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from "@nestjs/common"
import type { InvoicesService } from "./invoices.service"
import type { CreateInvoiceDto } from "./dto/create-invoice.dto"
import type { UpdateInvoiceDto } from "./dto/update-invoice.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/enums/user-role.enum"
import type { PaginationDto } from "../common/dto/pagination.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from "@nestjs/swagger"
import { InvoiceStatus } from "./enums/invoice-status.enum"

@ApiTags("Invoices")
@Controller("invoices")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Create a new invoice" })
  @ApiResponse({ status: 201, description: "Invoice created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    return this.invoicesService.create(createInvoiceDto, req.user.sub)
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Get all invoices" })
  @ApiResponse({ status: 200, description: "Invoices retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.invoicesService.findAll(paginationDto)
  }

  @Get("my-invoices")
  @ApiOperation({ summary: "Get current user invoices" })
  @ApiResponse({ status: 200, description: "Invoices retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findMyInvoices(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.invoicesService.findByUser(req.user.sub, paginationDto)
  }

  @Get("number/:invoiceNumber")
  @ApiOperation({ summary: "Get invoice by invoice number" })
  @ApiResponse({ status: 200, description: "Invoice retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  @ApiParam({ name: "invoiceNumber", description: "Invoice number" })
  findByInvoiceNumber(@Param("invoiceNumber") invoiceNumber: string) {
    return this.invoicesService.findByInvoiceNumber(invoiceNumber)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get invoice by ID" })
  @ApiResponse({ status: 200, description: "Invoice retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  @ApiParam({ name: "id", description: "Invoice ID" })
  findOne(@Param("id") id: string) {
    return this.invoicesService.findOne(id)
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Update an invoice" })
  @ApiResponse({ status: 200, description: "Invoice updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  @ApiParam({ name: "id", description: "Invoice ID" })
  update(@Param("id") id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @Request() req) {
    return this.invoicesService.update(id, updateInvoiceDto, req.user.sub)
  }

  @Patch(":id/status/:status")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Update invoice status" })
  @ApiResponse({ status: 200, description: "Invoice status updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  @ApiParam({ name: "id", description: "Invoice ID" })
  @ApiParam({ name: "status", description: "Invoice Status", enum: InvoiceStatus })
  updateStatus(@Param("id") id: string, @Param("status") status: InvoiceStatus, @Request() req) {
    return this.invoicesService.updateStatus(id, status, null, req.user.sub)
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Delete an invoice" })
  @ApiResponse({ status: 200, description: "Invoice deleted successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  @ApiParam({ name: "id", description: "Invoice ID" })
  remove(@Param("id") id: string, @Request() req) {
    return this.invoicesService.remove(id, req.user.sub)
  }
}

