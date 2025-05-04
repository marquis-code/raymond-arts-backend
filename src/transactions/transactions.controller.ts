import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from "@nestjs/common"
import { TransactionsService } from "./transactions.service"
import type { CreateTransactionDto } from "./dto/create-transaction.dto"
import type { UpdateTransactionDto } from "./dto/update-transaction.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/enums/user-role.enum"
import type { PaginationDto } from "../common/dto/pagination.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from "@nestjs/swagger"
import { TransactionStatus } from "./enums/transaction-status.enum"


@ApiTags("Transactions")
@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  // @UseGuards(RolesGuard)
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Create a transaction" })
  @ApiResponse({ status: 201, description: "Transaction created successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto)
  }

  @Get()
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Get all transactions" })
  @ApiResponse({ status: 200, description: "Transactions retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.transactionsService.findAll(paginationDto)
  }

  @Get("my-transactions")
  @ApiOperation({ summary: "Get current user transactions" })
  @ApiResponse({ status: 200, description: "Transactions retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findMyTransactions(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.transactionsService.findByUser(req.user.sub, paginationDto)
  }

  @Get("statistics")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Get transaction statistics" })
  @ApiResponse({ status: 200, description: "Statistics retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getStatistics() {
    return this.transactionsService.getTransactionStatistics()
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a transaction by ID" })
  @ApiResponse({ status: 200, description: "Transaction retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  @ApiParam({ name: "id", description: "Transaction ID" })
  findOne(@Param("id") id: string, @Request() req) {
    return this.transactionsService.findOne(id)
  }

  @Get("transaction-id/:transactionId")
  @ApiOperation({ summary: "Get a transaction by transaction ID" })
  @ApiResponse({ status: 200, description: "Transaction retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  @ApiParam({ name: "transactionId", description: "Transaction ID" })
  findByTransactionId(@Param("transactionId") transactionId: string) {
    return this.transactionsService.findByTransactionId(transactionId)
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update a transaction" })
  @ApiResponse({ status: 200, description: "Transaction updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  @ApiParam({ name: "id", description: "Transaction ID" })
  update(@Param("id") id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsService.update(id, updateTransactionDto)
  }

  @Patch(":id/status/:status")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update transaction status" })
  @ApiResponse({ status: 200, description: "Transaction status updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  @ApiParam({ name: "id", description: "Transaction ID" })
  @ApiParam({ name: "status", description: "Transaction Status", enum: TransactionStatus })
  updateStatus(@Param("id") id: string, @Param("status") status: TransactionStatus) {
    return this.transactionsService.updateStatus(id, status)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Delete a transaction" })
  @ApiResponse({ status: 200, description: "Transaction deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  @ApiParam({ name: "id", description: "Transaction ID" })
  remove(@Param("id") id: string) {
    return this.transactionsService.remove(id)
  }
}

