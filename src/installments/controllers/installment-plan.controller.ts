import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
  } from "@nestjs/common"
  import { InstallmentPlanService } from "../services/installment-plan.service"
  import { CreateInstallmentPlanDto } from "../dto/create-installment-plan.dto"
  import { UpdateInstallmentPlanDto } from "../dto/update-installment-plan.dto"
  import { PaginationParams } from "../../common/interfaces/pagination.interface"
  import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
  import { RolesGuard } from "../../auth/guards/roles.guard"
  import { Roles } from "../../auth/decorators/roles.decorator"
  import { UserRole } from "../../users/enums/user-role.enum"
  
  @Controller("installment-plans")
  @UseGuards(JwtAuthGuard)
  export class InstallmentPlanController {
    constructor(private readonly installmentPlanService: InstallmentPlanService) {}
  
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
    create(@Body() createInstallmentPlanDto: CreateInstallmentPlanDto, @Request() req) {
      return this.installmentPlanService.create(createInstallmentPlanDto, req.user.userId)
    }
  
    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STAFF)
    findAll(@Query() params: PaginationParams) {
      return this.installmentPlanService.findAll(params)
    }
  
    @Get("my-plans")
    findMyPlans(@Request() req, @Query() params: PaginationParams) {
      return this.installmentPlanService.findByCustomer(req.user.userId, params)
    }
  
    @Get(":id")
    findOne(@Param("id") id: string) {
      return this.installmentPlanService.findOne(id)
    }
  
    @Patch(":id")
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
    update(
      @Param("id") id: string,
      @Body() updateInstallmentPlanDto: UpdateInstallmentPlanDto,
      @Request() req,
    ) {
      return this.installmentPlanService.update(id, updateInstallmentPlanDto, req.user.userId)
    }
  }