import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from "@nestjs/common"
import type { PaymentLinksService } from "./payment-links.service"
import type { CreatePaymentLinkDto } from "./dto/create-payment-link.dto"
import type { UpdatePaymentLinkDto } from "./dto/update-payment-link.dto"
import type { UsePaymentLinkDto } from "./dto/use-payment-link.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/enums/user-role.enum"
import type { PaginationDto } from "../common/dto/pagination.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from "@nestjs/swagger"
import { PaymentLinkStatus } from "./enums/payment-link-status.enum"

@ApiTags("Payment Links")
@Controller("payment-links")
export class PaymentLinksController {
  constructor(private readonly paymentLinksService: PaymentLinksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new payment link" })
  @ApiResponse({ status: 201, description: "Payment link created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  create(@Body() createPaymentLinkDto: CreatePaymentLinkDto, @Request() req) {
    return this.paymentLinksService.create(createPaymentLinkDto, req.user.sub)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all payment links" })
  @ApiResponse({ status: 200, description: "Payment links retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.paymentLinksService.findAll(paginationDto)
  }

  @Get("my-links")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user payment links" })
  @ApiResponse({ status: 200, description: "Payment links retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findMyLinks(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.paymentLinksService.findByUser(req.user.sub, paginationDto)
  }

  @Get("link/:linkId")
  @ApiOperation({ summary: "Get payment link by link ID" })
  @ApiResponse({ status: 200, description: "Payment link retrieved successfully" })
  @ApiResponse({ status: 404, description: "Payment link not found" })
  @ApiParam({ name: "linkId", description: "Payment Link ID" })
  findByLinkId(@Param("linkId") linkId: string) {
    return this.paymentLinksService.findByLinkId(linkId)
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get payment link by ID" })
  @ApiResponse({ status: 200, description: "Payment link retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Payment link not found" })
  @ApiParam({ name: "id", description: "Payment Link ID" })
  findOne(@Param("id") id: string) {
    return this.paymentLinksService.findOne(id)
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a payment link" })
  @ApiResponse({ status: 200, description: "Payment link updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Payment link not found" })
  @ApiParam({ name: "id", description: "Payment Link ID" })
  update(@Param("id") id: string, @Body() updatePaymentLinkDto: UpdatePaymentLinkDto, @Request() req) {
    return this.paymentLinksService.update(id, updatePaymentLinkDto, req.user.sub)
  }

  @Patch(":id/status/:status")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update payment link status" })
  @ApiResponse({ status: 200, description: "Payment link status updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Payment link not found" })
  @ApiParam({ name: "id", description: "Payment Link ID" })
  @ApiParam({ name: "status", description: "Payment Link Status", enum: PaymentLinkStatus })
  updateStatus(@Param("id") id: string, @Param("status") status: PaymentLinkStatus, @Request() req) {
    return this.paymentLinksService.updateStatus(id, status, req.user.sub)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a payment link" })
  @ApiResponse({ status: 200, description: "Payment link deleted successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Payment link not found" })
  @ApiParam({ name: "id", description: "Payment Link ID" })
  remove(@Param("id") id: string, @Request() req) {
    return this.paymentLinksService.remove(id, req.user.sub)
  }

  @Post("use")
  @ApiOperation({ summary: "Use a payment link" })
  @ApiResponse({ status: 200, description: "Payment link used successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Payment link not found" })
  usePaymentLink(@Body() usePaymentLinkDto: UsePaymentLinkDto, @Request() req) {
    const userId = req.user?.sub
    return this.paymentLinksService.usePaymentLink(usePaymentLinkDto, userId)
  }
}

