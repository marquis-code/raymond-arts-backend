// import {
//     Controller,
//     Get,
//     Post,
//     Put,
//     Body,
//     Param,
//     Query,
//     UseGuards,
//     Request,
//     HttpStatus,
//     HttpException,
//     ParseIntPipe,
//     DefaultValuePipe,
//   } from "@nestjs/common"
//   import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from "@nestjs/swagger"
//   import { InstallmentsService } from "./installments.service"
//   import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
//   import { RolesGuard } from "../auth/guards/roles.guard"
//   import { Roles } from "../auth/decorators/roles.decorator"
//   import { UserRole } from "../users/enums/user-role.enum"
//   import { CreateInstallmentPlanDto } from "./dto/create-installment-plan.dto"
//   import { ProcessInstallmentPaymentDto } from "./dto/process-installment-payment.dto"
//   import { UpdateInstallmentPlanDto } from "./dto/update-installment-plan.dto"
//   import { InstallmentPlan, InstallmentStatus } from "./schemas/installment-plan.schema"
  
//   @ApiTags("Installments")
//   @Controller("installments")
//   @UseGuards(JwtAuthGuard)
//   @ApiBearerAuth()
//   export class InstallmentsController {
//     constructor(private readonly installmentsService: InstallmentsService) {}
  
//     // Customer endpoints
//     @Post("plans")
//     @ApiOperation({ summary: "Create a new installment plan" })
//     @ApiResponse({ status: 201, description: "Installment plan created successfully" })
//     @ApiResponse({ status: 400, description: "Bad request - validation failed" })
//     @ApiResponse({ status: 404, description: "Order not found" })
//     async createInstallmentPlan(
//       createInstallmentPlanDto: CreateInstallmentPlanDto,
//       @Request() req: any,
//     ): Promise<{ success: boolean; data: InstallmentPlan; message: string }> {
//       try {
//         const plan = await this.installmentsService.createInstallmentPlan(createInstallmentPlanDto, req.user.id)
  
//         return {
//           success: true,
//           data: plan,
//           message: "Installment plan created successfully",
//         }
//       } catch (error) {
//         throw new HttpException(
//           {
//             success: false,
//             message: error.message || "Failed to create installment plan",
//           },
//           error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         )
//       }
//     }
  
//     @Get("plans/my")
//     @ApiOperation({ summary: "Get current user installment plans" })
//     @ApiResponse({ status: 200, description: "User installment plans retrieved successfully" })
//     @ApiQuery({ name: "status", required: false, enum: InstallmentStatus })
//     @ApiQuery({ name: "page", required: false, type: Number, description: "Page number (default: 1)" })
//     @ApiQuery({ name: "limit", required: false, type: Number, description: "Items per page (default: 10)" })
//     async getUserInstallmentPlans(
//       @Request() req: any,
//       @Query('status') status?: InstallmentStatus,
//       @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
//       @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
//     ): Promise<{ success: boolean; data: any; message: string }> {
//       try {
//         const plans = await this.installmentsService.getUserInstallmentPlans(req.user.id, {
//           status,
//           page,
//           limit,
//         })
  
//         return {
//           success: true,
//           data: plans,
//           message: "User installment plans retrieved successfully",
//         }
//       } catch (error) {
//         throw new HttpException(
//           {
//             success: false,
//             message: error.message || "Failed to retrieve installment plans",
//           },
//           error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         )
//       }
//     }
  
//     @Get("plans/:id")
//     @ApiOperation({ summary: "Get installment plan details" })
//     @ApiResponse({ status: 200, description: "Installment plan details retrieved successfully" })
//     @ApiResponse({ status: 404, description: "Installment plan not found" })
//     @ApiParam({ name: "id", description: "Installment plan ID" })
//     async getInstallmentPlan(
//       @Param('id') id: string,
//       @Request() req: any,
//     ): Promise<{ success: boolean; data: InstallmentPlan; message: string }> {
//       try {
//         const plan = await this.installmentsService.getInstallmentPlan(id, req.user.id)
  
//         return {
//           success: true,
//           data: plan,
//           message: "Installment plan details retrieved successfully",
//         }
//       } catch (error) {
//         throw new HttpException(
//           {
//             success: false,
//             message: error.message || "Failed to retrieve installment plan",
//           },
//           error.status || HttpStatus.NOT_FOUND,
//         )
//       }
//     }
  
//     @Post("payments/process")
//     @ApiOperation({ summary: "Process an installment payment" })
//     @ApiResponse({ status: 200, description: "Installment payment processed successfully" })
//     @ApiResponse({ status: 400, description: "Bad request - payment already processed or invalid" })
//     @ApiResponse({ status: 404, description: "Installment plan or payment not found" })
//     async processInstallmentPayment(
//       processPaymentDto: ProcessInstallmentPaymentDto,
//       @Request() req: any,
//     ): Promise<{ success: boolean; data: InstallmentPlan; message: string }> {
//       try {
//         const updatedPlan = await this.installmentsService.processInstallmentPayment(processPaymentDto, req.user.id)
  
//         return {
//           success: true,
//           data: updatedPlan,
//           message: "Installment payment processed successfully",
//         }
//       } catch (error) {
//         throw new HttpException(
//           {
//             success: false,
//             message: error.message || "Failed to process installment payment",
//           },
//           error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         )
//       }
//     }
  
//     @Get("payments/upcoming")
//     @ApiOperation({ summary: "Get upcoming payments for current user" })
//     @ApiResponse({ status: 200, description: "Upcoming payments retrieved successfully" })
//     @ApiQuery({ name: "days", required: false, type: Number, description: "Days ahead to check (default: 30)" })
//     async getUpcomingPayments(
//       @Request() req: any,
//       @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number = 30,
//     ): Promise<{ success: boolean; data: any; message: string }> {
//       try {
//         const upcomingPayments = await this.installmentsService.getUpcomingPayments(req.user.id, days)
  
//         return {
//           success: true,
//           data: upcomingPayments,
//           message: "Upcoming payments retrieved successfully",
//         }
//       } catch (error) {
//         throw new HttpException(
//           {
//             success: false,
//             message: error.message || "Failed to retrieve upcoming payments",
//           },
//           error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         )
//       }
//     }
  
//     @Get('payments/overdue')
//     @ApiOperation({ summary: 'Get overdue payments for current user' })
//     @ApiResponse({ status: 200, description: 'Overdue payments retrieved successfully' })
//     async getOverduePayments(
//       @Request() req: any,
//     ): Promise<{ success: boolean; data: any; message: string }> {
//       try {
//         const overduePayments = await this.installmentsService.getOverduePayments(req.user.id)
  
//         return {
//           success: true,
//           data: overduePayments,
//           message: 'Overdue payments retrieved successfully',
//         }
//       } catch (error) {
//         throw new HttpException(
//           {
//             success: false,
//             message: error.message || 'Failed to retrieve overdue payments',
//           },
//           error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         )
//       }
//     }
  
//     // Admin endpoints
//     @Get("admin/plans")
//     @UseGuards(RolesGuard)
//     @Roles(UserRole.ADMIN, UserRole.ADMIN)
//     @ApiOperation({ summary: "Get all installment plans (Admin only)" })
//     @ApiResponse({ status: 200, description: "All installment plans retrieved successfully" })
//     @ApiQuery({ name: "status", required: false, enum: InstallmentStatus })
//     @ApiQuery({ name: "customerId", required: false, type: String })
//     @ApiQuery({ name: "page", required: false, type: Number })
//     @ApiQuery({ name: "limit", required: false, type: Number })
//     @ApiQuery({ name: "search", required: false, type: String })
//     async getAllInstallmentPlans(
//       @Query('status') status?: InstallmentStatus,
//       @Query('customerId') customerId?: string,
//       @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
//       @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
//       @Query('search') search?: string,
//     ): Promise<{ success: boolean; data: any; message: string }> {
//       try {
//         const plans = await this.installmentsService.getAllInstallmentPlans({
//           status,
//           customerId,
//           page,
//           limit,
//           search,
//         })
  
//         return {
//           success: true,
//           data: plans,
//           message: "All installment plans retrieved successfully",
//         }
//       } catch (error) {
//         throw new HttpException(
//           {
//             success: false,
//             message: error.message || "Failed to retrieve installment plans",
//           },
//           error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         )
//       }
//     }
  
//     @Get("admin/analytics")
//     @UseGuards(RolesGuard)
//     @Roles(UserRole.ADMIN, UserRole.ADMIN)
//     @ApiOperation({ summary: "Get installment analytics (Admin only)" })
//     @ApiResponse({ status: 200, description: "Installment analytics retrieved successfully" })
//     @ApiQuery({ name: "startDate", required: false, type: String, description: "Start date (YYYY-MM-DD)" })
//     @ApiQuery({ name: "endDate", required: false, type: String, description: "End date (YYYY-MM-DD)" })
//     async getInstallmentAnalytics(
//       @Query('startDate') startDate?: string,
//       @Query('endDate') endDate?: string,
//     ): Promise<{ success: boolean; data: any; message: string }> {
//       try {
//         const analytics = await this.installmentsService.getInstallmentAnalytics({
//           startDate: startDate ? new Date(startDate) : undefined,
//           endDate: endDate ? new Date(endDate) : undefined,
//         })
  
//         return {
//           success: true,
//           data: analytics,
//           message: "Installment analytics retrieved successfully",
//         }
//       } catch (error) {
//         throw new HttpException(
//           {
//             success: false,
//             message: error.message || "Failed to retrieve installment analytics",
//           },
//           error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         )
//       }
//     }
  
//     @Get("admin/defaulted")
//     @UseGuards(RolesGuard)
//     @Roles(UserRole.ADMIN, UserRole.ADMIN)
//     @ApiOperation({ summary: "Get defaulted installment plans (Admin only)" })
//     @ApiResponse({ status: 200, description: "Defaulted plans retrieved successfully" })
//     @ApiQuery({ name: "page", required: false, type: Number })
//     @ApiQuery({ name: "limit", required: false, type: Number })
//     async getDefaultedPlans(
//       @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
//       @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
//     ): Promise<{ success: boolean; data: any; message: string }> {
//       try {
//         const defaultedPlans = await this.installmentsService.getDefaultedPlans({ page, limit })
  
//         return {
//           success: true,
//           data: defaultedPlans,
//           message: "Defaulted plans retrieved successfully",
//         }
//       } catch (error) {
//         throw new HttpException(
//           {
//             success: false,
//             message: error.message || "Failed to retrieve defaulted plans",
//           },
//           error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         )
//       }
//     }
  
//     @Put("admin/plans/:id")
//     @UseGuards(RolesGuard)
//     @Roles(UserRole.ADMIN, UserRole.ADMIN)
//     @ApiOperation({ summary: "Update installment plan (Admin only)" })
//     @ApiResponse({ status: 200, description: "Installment plan updated successfully" })
//     @ApiResponse({ status: 404, description: "Installment plan not found" })
//     @ApiParam({ name: "id", description: "Installment plan ID" })
//     async updateInstallmentPlan(
//       @Param('id') id: string,
//       updateInstallmentPlanDto: UpdateInstallmentPlanDto,
//       @Request() req: any,
//     ): Promise<{ success: boolean; data: InstallmentPlan; message: string }> {
//       try {
//         const updatedPlan = await this.installmentsService.updateInstallmentPlan(
//           id,
//           updateInstallmentPlanDto,
//           req.user.id,
//         )
  
//         return {
//           success: true,
//           data: updatedPlan,
//           message: "Installment plan updated successfully",
//         }
//       } catch (error) {
//         throw new HttpException(
//           {
//             success: false,
//             message: error.message || "Failed to update installment plan",
//           },
//           error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         )
//       }
//     }
  
//     @Put("admin/plans/:id/cancel")
//     @UseGuards(RolesGuard)
//     @Roles(UserRole.ADMIN, UserRole.ADMIN)
//     @ApiOperation({ summary: "Cancel installment plan (Admin only)" })
//     @ApiResponse({ status: 200, description: "Installment plan cancelled successfully" })
//     @ApiResponse({ status: 404, description: "Installment plan not found" })
//     @ApiParam({ name: "id", description: "Installment plan ID" })
//     async cancelInstallmentPlan(
//       @Param('id') id: string,
//       @Body('reason') reason: string,
//       @Request() req: any,
//     ): Promise<{ success: boolean; data: InstallmentPlan; message: string }> {
//       try {
//         const cancelledPlan = await this.installmentsService.cancelInstallmentPlan(id, reason, req.user.id)
  
//         return {
//           success: true,
//           data: cancelledPlan,
//           message: "Installment plan cancelled successfully",
//         }
//       } catch (error) {
//         throw new HttpException(
//           {
//             success: false,
//             message: error.message || "Failed to cancel installment plan",
//           },
//           error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         )
//       }
//     }
  
//     @Post("admin/plans/:id/restructure")
//     @UseGuards(RolesGuard)
//     @Roles(UserRole.ADMIN, UserRole.ADMIN)
//     @ApiOperation({ summary: "Restructure installment plan (Admin only)" })
//     @ApiResponse({ status: 200, description: "Installment plan restructured successfully" })
//     @ApiResponse({ status: 404, description: "Installment plan not found" })
//     @ApiParam({ name: "id", description: "Installment plan ID" })
//     async restructureInstallmentPlan(
//       @Param('id') id: string,
//       @Body() restructureData: { newTerms: number; newInterestRate?: number; reason: string },
//       @Request() req: any,
//     ): Promise<{ success: boolean; data: InstallmentPlan; message: string }> {
//       try {
//         const restructuredPlan = await this.installmentsService.restructureInstallmentPlan(
//           id,
//           restructureData,
//           req.user.id,
//         )
  
//         return {
//           success: true,
//           data: restructuredPlan,
//           message: "Installment plan restructured successfully",
//         }
//       } catch (error) {
//         throw new HttpException(
//           {
//             success: false,
//             message: error.message || "Failed to restructure installment plan",
//           },
//           error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         )
//       }
//     }
  
//     @Post('admin/reminders/send')
//     @UseGuards(RolesGuard)
//     @Roles(UserRole.ADMIN, UserRole.ADMIN)
//     @ApiOperation({ summary: 'Manually send payment reminders (Admin only)' })
//     @ApiResponse({ status: 200, description: 'Payment reminders sent successfully' })
//     async sendPaymentReminders(
//       @Body() reminderData: { planIds?: string[]; type: 'upcoming' | 'overdue' },
//     ): Promise<{ success: boolean; data: any; message: string }> {
//       try {
//         const result = await this.installmentsService.sendManualReminders(reminderData)
  
//         return {
//           success: true,
//           data: result,
//           message: 'Payment reminders sent successfully',
//         }
//       } catch (error) {
//         throw new HttpException(
//           {
//             success: false,
//             message: error.message || 'Failed to send payment reminders',
//           },
//           error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         )
//       }
//     }
  
//     @Get("admin/reports/collection")
//     @UseGuards(RolesGuard)
//     @Roles(UserRole.ADMIN, UserRole.ADMIN)
//     @ApiOperation({ summary: "Get collection report (Admin only)" })
//     @ApiResponse({ status: 200, description: "Collection report retrieved successfully" })
//     @ApiQuery({ name: "startDate", required: false, type: String })
//     @ApiQuery({ name: "endDate", required: false, type: String })
//     @ApiQuery({ name: "groupBy", required: false, enum: ["day", "week", "month"] })
//     async getCollectionReport(
//       @Query('startDate') startDate?: string,
//       @Query('endDate') endDate?: string,
//       @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'month',
//     ): Promise<{ success: boolean; data: any; message: string }> {
//       try {
//         const report = await this.installmentsService.getCollectionReport({
//           startDate: startDate ? new Date(startDate) : undefined,
//           endDate: endDate ? new Date(endDate) : undefined,
//           groupBy,
//         })
  
//         return {
//           success: true,
//           data: report,
//           message: "Collection report retrieved successfully",
//         }
//       } catch (error) {
//         throw new HttpException(
//           {
//             success: false,
//             message: error.message || "Failed to retrieve collection report",
//           },
//           error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         )
//       }
//     }
  
//     @Get("admin/dashboard")
//     @UseGuards(RolesGuard)
//     @Roles(UserRole.ADMIN, UserRole.ADMIN)
//     @ApiOperation({ summary: "Get installment dashboard data (Admin only)" })
//     @ApiResponse({ status: 200, description: "Dashboard data retrieved successfully" })
//     async getInstallmentDashboard(): Promise<{ success: boolean; data: any; message: string }> {
//       try {
//         const dashboardData = await this.installmentsService.getInstallmentDashboard()
  
//         return {
//           success: true,
//           data: dashboardData,
//           message: "Dashboard data retrieved successfully",
//         }
//       } catch (error) {
//         throw new HttpException(
//           {
//             success: false,
//             message: error.message || "Failed to retrieve dashboard data",
//           },
//           error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         )
//       }
//     }
//   }
  

import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    HttpStatus,
    HttpException,
    ParseIntPipe,
    DefaultValuePipe,
  } from "@nestjs/common"
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from "@nestjs/swagger"
  import { InstallmentsService } from "./installments.service"
  import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
  import { RolesGuard } from "../auth/guards/roles.guard"
  import { Roles } from "../auth/decorators/roles.decorator"
  import { UserRole } from "../users/enums/user-role.enum"
  import { CreateInstallmentPlanDto } from "./dto/create-installment-plan.dto"
  import { ProcessInstallmentPaymentDto } from "./dto/process-installment-payment.dto"
  import { UpdateInstallmentPlanDto } from "./dto/update-installment-plan.dto"
  import { InstallmentPlan, InstallmentStatus } from "./schemas/installment-plan.schema"
  
  @ApiTags("Installments")
  @Controller("installments")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  export class InstallmentsController {
    constructor(private readonly installmentsService: InstallmentsService) {}
  
    // Customer endpoints
    @Post("plans")
    @ApiOperation({ summary: "Create a new installment plan" })
    @ApiResponse({ status: 201, description: "Installment plan created successfully" })
    @ApiResponse({ status: 400, description: "Bad request - validation failed" })
    @ApiResponse({ status: 404, description: "Order not found" })
    async createInstallmentPlan(
      @Body() createInstallmentPlanDto: CreateInstallmentPlanDto,
      @Request() req: any,
    ): Promise<{ success: boolean; data: InstallmentPlan; message: string }> {
      try {
        // Convert the DTO to the service interface format
        const serviceDto = {
          orderId: createInstallmentPlanDto.orderId,
          numberOfInstallments: createInstallmentPlanDto.numberOfInstallments,
          downPayment: createInstallmentPlanDto.downPayment,
          startDate: createInstallmentPlanDto.startDate,
        }
  
        const plan = await this.installmentsService.createInstallmentPlan(serviceDto, req.user.id)
  
        return {
          success: true,
          data: plan,
          message: "Installment plan created successfully",
        }
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || "Failed to create installment plan",
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
    }
  
    @Get("plans/my")
    @ApiOperation({ summary: "Get current user installment plans" })
    @ApiResponse({ status: 200, description: "User installment plans retrieved successfully" })
    @ApiQuery({ name: "status", required: false, enum: InstallmentStatus })
    @ApiQuery({ name: "page", required: false, type: Number, description: "Page number (default: 1)" })
    @ApiQuery({ name: "limit", required: false, type: Number, description: "Items per page (default: 10)" })
    async getUserInstallmentPlans(
      @Request() req: any,
      @Query('status') status?: InstallmentStatus,
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ): Promise<{ success: boolean; data: any; message: string }> {
      try {
        const plans = await this.installmentsService.getUserInstallmentPlans(req.user.id, {
          status,
          page,
          limit,
        })
  
        return {
          success: true,
          data: plans,
          message: "User installment plans retrieved successfully",
        }
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || "Failed to retrieve installment plans",
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
    }
  
    @Get("plans/:id")
    @ApiOperation({ summary: "Get installment plan details" })
    @ApiResponse({ status: 200, description: "Installment plan details retrieved successfully" })
    @ApiResponse({ status: 404, description: "Installment plan not found" })
    @ApiParam({ name: "id", description: "Installment plan ID" })
    async getInstallmentPlan(
      @Param('id') id: string,
      @Request() req: any,
    ): Promise<{ success: boolean; data: InstallmentPlan; message: string }> {
      try {
        const plan = await this.installmentsService.getInstallmentPlan(id, req.user.id)
  
        return {
          success: true,
          data: plan,
          message: "Installment plan details retrieved successfully",
        }
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || "Failed to retrieve installment plan",
          },
          error.status || HttpStatus.NOT_FOUND,
        )
      }
    }
  
    @Post("payments/process")
    @ApiOperation({ summary: "Process an installment payment" })
    @ApiResponse({ status: 200, description: "Installment payment processed successfully" })
    @ApiResponse({ status: 400, description: "Bad request - payment already processed or invalid" })
    @ApiResponse({ status: 404, description: "Installment plan or payment not found" })
    async processInstallmentPayment(
      @Body() processPaymentDto: ProcessInstallmentPaymentDto,
      @Request() req: any,
    ): Promise<{ success: boolean; data: InstallmentPlan; message: string }> {
      try {
        const updatedPlan = await this.installmentsService.processInstallmentPayment(processPaymentDto, req.user.id)
  
        return {
          success: true,
          data: updatedPlan,
          message: "Installment payment processed successfully",
        }
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || "Failed to process installment payment",
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
    }
  
    @Get("payments/upcoming")
    @ApiOperation({ summary: "Get upcoming payments for current user" })
    @ApiResponse({ status: 200, description: "Upcoming payments retrieved successfully" })
    @ApiQuery({ name: "days", required: false, type: Number, description: "Days ahead to check (default: 30)" })
    async getUpcomingPayments(
      @Request() req: any,
      @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number = 30,
    ): Promise<{ success: boolean; data: any; message: string }> {
      try {
        const upcomingPayments = await this.installmentsService.getUpcomingPayments(req.user.id, days)
  
        return {
          success: true,
          data: upcomingPayments,
          message: "Upcoming payments retrieved successfully",
        }
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || "Failed to retrieve upcoming payments",
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
    }
  
    @Get('payments/overdue')
    @ApiOperation({ summary: 'Get overdue payments for current user' })
    @ApiResponse({ status: 200, description: 'Overdue payments retrieved successfully' })
    async getOverduePayments(
      @Request() req: any,
    ): Promise<{ success: boolean; data: any; message: string }> {
      try {
        const overduePayments = await this.installmentsService.getOverduePayments(req.user.id)
  
        return {
          success: true,
          data: overduePayments,
          message: 'Overdue payments retrieved successfully',
        }
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || 'Failed to retrieve overdue payments',
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
    }
  
    // Admin endpoints
    @Get("admin/plans")
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: "Get all installment plans (Admin only)" })
    @ApiResponse({ status: 200, description: "All installment plans retrieved successfully" })
    @ApiQuery({ name: "status", required: false, enum: InstallmentStatus })
    @ApiQuery({ name: "customerId", required: false, type: String })
    @ApiQuery({ name: "page", required: false, type: Number })
    @ApiQuery({ name: "limit", required: false, type: Number })
    @ApiQuery({ name: "search", required: false, type: String })
    async getAllInstallmentPlans(
      @Query('status') status?: InstallmentStatus,
      @Query('customerId') customerId?: string,
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
      @Query('search') search?: string,
    ): Promise<{ success: boolean; data: any; message: string }> {
      try {
        const plans = await this.installmentsService.getAllInstallmentPlans({
          status,
          customerId,
          page,
          limit,
          search,
        })
  
        return {
          success: true,
          data: plans,
          message: "All installment plans retrieved successfully",
        }
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || "Failed to retrieve installment plans",
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
    }
  
    @Get("admin/analytics")
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: "Get installment analytics (Admin only)" })
    @ApiResponse({ status: 200, description: "Installment analytics retrieved successfully" })
    @ApiQuery({ name: "startDate", required: false, type: String, description: "Start date (YYYY-MM-DD)" })
    @ApiQuery({ name: "endDate", required: false, type: String, description: "End date (YYYY-MM-DD)" })
    async getInstallmentAnalytics(
      @Query('startDate') startDate?: string,
      @Query('endDate') endDate?: string,
    ): Promise<{ success: boolean; data: any; message: string }> {
      try {
        const analytics = await this.installmentsService.getInstallmentAnalytics({
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        })
  
        return {
          success: true,
          data: analytics,
          message: "Installment analytics retrieved successfully",
        }
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || "Failed to retrieve installment analytics",
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
    }
  
    @Get("admin/defaulted")
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: "Get defaulted installment plans (Admin only)" })
    @ApiResponse({ status: 200, description: "Defaulted plans retrieved successfully" })
    @ApiQuery({ name: "page", required: false, type: Number })
    @ApiQuery({ name: "limit", required: false, type: Number })
    async getDefaultedPlans(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ): Promise<{ success: boolean; data: any; message: string }> {
      try {
        const defaultedPlans = await this.installmentsService.getDefaultedPlans({ page, limit })
  
        return {
          success: true,
          data: defaultedPlans,
          message: "Defaulted plans retrieved successfully",
        }
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || "Failed to retrieve defaulted plans",
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
    }
  
    @Put("admin/plans/:id")
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: "Update installment plan (Admin only)" })
    @ApiResponse({ status: 200, description: "Installment plan updated successfully" })
    @ApiResponse({ status: 404, description: "Installment plan not found" })
    @ApiParam({ name: "id", description: "Installment plan ID" })
    async updateInstallmentPlan(
      @Param('id') id: string,
      @Body() updateInstallmentPlanDto: UpdateInstallmentPlanDto,
      @Request() req: any,
    ): Promise<{ success: boolean; data: InstallmentPlan; message: string }> {
      try {
        const updatedPlan = await this.installmentsService.updateInstallmentPlan(
          id,
          updateInstallmentPlanDto,
          req.user.id,
        )
  
        return {
          success: true,
          data: updatedPlan,
          message: "Installment plan updated successfully",
        }
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || "Failed to update installment plan",
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
    }
  
    @Put("admin/plans/:id/cancel")
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: "Cancel installment plan (Admin only)" })
    @ApiResponse({ status: 200, description: "Installment plan cancelled successfully" })
    @ApiResponse({ status: 404, description: "Installment plan not found" })
    @ApiParam({ name: "id", description: "Installment plan ID" })
    async cancelInstallmentPlan(
      @Param('id') id: string,
      @Body('reason') reason: string,
      @Request() req: any,
    ): Promise<{ success: boolean; data: InstallmentPlan; message: string }> {
      try {
        const cancelledPlan = await this.installmentsService.cancelInstallmentPlan(id, reason, req.user.id)
  
        return {
          success: true,
          data: cancelledPlan,
          message: "Installment plan cancelled successfully",
        }
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || "Failed to cancel installment plan",
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
    }
  
    @Post("admin/plans/:id/restructure")
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: "Restructure installment plan (Admin only)" })
    @ApiResponse({ status: 200, description: "Installment plan restructured successfully" })
    @ApiResponse({ status: 404, description: "Installment plan not found" })
    @ApiParam({ name: "id", description: "Installment plan ID" })
    async restructureInstallmentPlan(
      @Param('id') id: string,
      @Body() restructureData: { newTerms: number; newInterestRate?: number; reason: string },
      @Request() req: any,
    ): Promise<{ success: boolean; data: InstallmentPlan; message: string }> {
      try {
        const restructuredPlan = await this.installmentsService.restructureInstallmentPlan(
          id,
          restructureData,
          req.user.id,
        )
  
        return {
          success: true,
          data: restructuredPlan,
          message: "Installment plan restructured successfully",
        }
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || "Failed to restructure installment plan",
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
    }
  
    @Post('admin/reminders/send')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Manually send payment reminders (Admin only)' })
    @ApiResponse({ status: 200, description: 'Payment reminders sent successfully' })
    async sendPaymentReminders(
      @Body() reminderData: { planIds?: string[]; type: 'upcoming' | 'overdue' },
    ): Promise<{ success: boolean; data: any; message: string }> {
      try {
        const result = await this.installmentsService.sendManualReminders(reminderData)
  
        return {
          success: true,
          data: result,
          message: 'Payment reminders sent successfully',
        }
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || 'Failed to send payment reminders',
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
    }
  
    @Get("admin/reports/collection")
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: "Get collection report (Admin only)" })
    @ApiResponse({ status: 200, description: "Collection report retrieved successfully" })
    @ApiQuery({ name: "startDate", required: false, type: String })
    @ApiQuery({ name: "endDate", required: false, type: String })
    @ApiQuery({ name: "groupBy", required: false, enum: ["day", "week", "month"] })
    async getCollectionReport(
      @Query('startDate') startDate?: string,
      @Query('endDate') endDate?: string,
      @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'month',
    ): Promise<{ success: boolean; data: any; message: string }> {
      try {
        const report = await this.installmentsService.getCollectionReport({
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          groupBy,
        })
  
        return {
          success: true,
          data: report,
          message: "Collection report retrieved successfully",
        }
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || "Failed to retrieve collection report",
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
    }
  
    @Get("admin/dashboard")
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: "Get installment dashboard data (Admin only)" })
    @ApiResponse({ status: 200, description: "Dashboard data retrieved successfully" })
    async getInstallmentDashboard(): Promise<{ success: boolean; data: any; message: string }> {
      try {
        const dashboardData = await this.installmentsService.getInstallmentDashboard()
  
        return {
          success: true,
          data: dashboardData,
          message: "Dashboard data retrieved successfully",
        }
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || "Failed to retrieve dashboard data",
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
    }
  }
  