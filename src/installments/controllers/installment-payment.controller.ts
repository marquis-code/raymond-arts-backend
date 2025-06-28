import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
  } from "@nestjs/common"
  import { InstallmentPaymentService } from "../services/installment-payment.service"
  import { ProcessPaymentDto } from "../dto/process-payment.dto"
  import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
  
  @Controller("installment-payments")
  @UseGuards(JwtAuthGuard)
  export class InstallmentPaymentController {
    constructor(private readonly installmentPaymentService: InstallmentPaymentService) {}
  
    @Post(":id/process")
    processPayment(
      @Param("id") id: string,
      @Body() processPaymentDto: ProcessPaymentDto,
      @Request() req,
    ) {
      return this.installmentPaymentService.processPayment(id, processPaymentDto, req.user.userId)
    }
  
    @Post(":id/auto-process")
    processAutoPayment(@Param("id") id: string) {
      return this.installmentPaymentService.processAutoPayment(id)
    }
  
    @Get("upcoming")
    findUpcomingPayments(@Request() req) {
      return this.installmentPaymentService.findUpcomingPayments(req.user.userId)
    }
  
    @Get("overdue")
    findMyOverduePayments(@Request() req) {
      return this.installmentPaymentService.findOverduePayments(req.user.userId)
    }
  }