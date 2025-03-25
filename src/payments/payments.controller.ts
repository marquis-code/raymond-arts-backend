import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from "@nestjs/common"
import type { PaymentsService } from "./payments.service"
import type { ProcessPaymentDto } from "./dto/process-payment.dto"
import type { VerifyPaymentDto } from "./dto/verify-payment.dto"
import type { FlutterwaveWebhookDto } from "./dto/flutterwave-webhook.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"

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
}

