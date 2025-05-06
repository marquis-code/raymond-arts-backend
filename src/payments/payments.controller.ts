import { Controller, Post, Body, Get, Query, UseGuards, Request, HttpCode, HttpStatus } from "@nestjs/common"
import { PaymentsService } from "./payments.service"
import type { ProcessPaymentDto } from "./dto/process-payment.dto"
import type { VerifyPaymentDto } from "./dto/verify-payment.dto"
import type { FlutterwaveWebhookDto } from "./dto/flutterwave-webhook.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,  ApiQuery } from "@nestjs/swagger"

@ApiTags("Payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("process")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Process a payment" })
  @ApiResponse({ status: 200, description: "Payment processed successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @HttpCode(HttpStatus.OK)
  processPayment(@Body() processPaymentDto: ProcessPaymentDto, @Request() req) {
    return this.paymentsService.processPayment(processPaymentDto, req.user.sub)
  }

  @Post("verify")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Verify a payment" })
  @ApiResponse({ status: 200, description: "Payment verified successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @HttpCode(HttpStatus.OK)
  verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto, @Request() req) {
    return this.paymentsService.verifyPayment(verifyPaymentDto, req.user.sub)
  }

  @Post("webhook/flutterwave")
  @ApiOperation({ summary: "Flutterwave webhook" })
  @ApiResponse({ status: 200, description: "Webhook processed successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @HttpCode(HttpStatus.OK)
  flutterwaveWebhook(@Body() webhookDto: FlutterwaveWebhookDto) {
    return this.paymentsService.handleFlutterwaveWebhook(webhookDto)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all payments" })
  @ApiResponse({ status: 200, description: "Returns all payments" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by payment status' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter by start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter by end date (ISO format)' })
  @ApiQuery({ name: 'paymentMethod', required: false, type: String, description: 'Filter by payment method' })
  getAllPayments(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('paymentMethod') paymentMethod?: string
  ) {
    return this.paymentsService.getAllPayments(
      req.user.sub,
      {
        page: page ? parseInt(page.toString()) : 1,
        limit: limit ? parseInt(limit.toString()) : 10,
        status,
        startDate,
        endDate,
        paymentMethod
      }
    )
  }
}

