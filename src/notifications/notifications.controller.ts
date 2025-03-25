import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from "@nestjs/common"
import type { NotificationsService } from "./notifications.service"
import type { CreateNotificationDto } from "./dto/create-notification.dto"
import type { UpdateNotificationDto } from "./dto/update-notification.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/enums/user-role.enum"
import type { PaginationDto } from "../common/dto/pagination.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from "@nestjs/swagger"

@ApiTags("Notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Create a notification" })
  @ApiResponse({ status: 201, description: "Notification created successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.createNotification(createNotificationDto)
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Get all notifications" })
  @ApiResponse({ status: 200, description: "Notifications retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.notificationsService.findAll(paginationDto)
  }

  @Get("my-notifications")
  @ApiOperation({ summary: "Get current user notifications" })
  @ApiResponse({ status: 200, description: "Notifications retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findMyNotifications(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.notificationsService.findByUser(req.user.sub, paginationDto)
  }

  @Get("admin")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Get admin notifications" })
  @ApiResponse({ status: 200, description: "Admin notifications retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findAdminNotifications(@Query() paginationDto: PaginationDto) {
    return this.notificationsService.findAdminNotifications(paginationDto)
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread notifications count" })
  @ApiResponse({ status: 200, description: "Unread count retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.sub)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a notification by ID" })
  @ApiResponse({ status: 200, description: "Notification retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Notification not found" })
  @ApiParam({ name: "id", description: "Notification ID" })
  findOne(@Param("id") id: string, @Request() req) {
    return this.notificationsService.findOne(id)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a notification" })
  @ApiResponse({ status: 200, description: "Notification updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Notification not found" })
  @ApiParam({ name: "id", description: "Notification ID" })
  update(@Param("id") id: string, @Body() updateNotificationDto: UpdateNotificationDto, @Request() req) {
    return this.notificationsService.update(id, updateNotificationDto)
  }

  @Patch(":id/mark-as-read")
  @ApiOperation({ summary: "Mark notification as read" })
  @ApiResponse({ status: 200, description: "Notification marked as read successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Notification not found" })
  @ApiParam({ name: "id", description: "Notification ID" })
  markAsRead(@Param("id") id: string, @Request() req) {
    return this.notificationsService.markAsRead(id)
  }

  @Patch("mark-all-as-read")
  @ApiOperation({ summary: "Mark all notifications as read" })
  @ApiResponse({ status: 200, description: "All notifications marked as read successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.sub)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a notification" })
  @ApiResponse({ status: 200, description: "Notification deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Notification not found" })
  @ApiParam({ name: "id", description: "Notification ID" })
  remove(@Param("id") id: string, @Request() req) {
    return this.notificationsService.remove(id)
  }
}

