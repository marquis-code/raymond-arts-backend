import { Controller, Get, Query, Param, UseGuards } from "@nestjs/common"
import type { AuditService } from "./audit.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/enums/user-role.enum"
import type { PaginationDto } from "../common/dto/pagination.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get all audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.auditService.findAll(paginationDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get audit logs by user' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByUser(
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.auditService.findByUser(userId, paginationDto);
  }

  @Get('module/:module')
  @ApiOperation({ summary: 'Get audit logs by module' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByModule(
    @Param('module') module: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.auditService.findByModule(module, paginationDto  paginationDto: PaginationDto,
  ) 
    return this.auditService.findByModule(module, paginationDto);
}

