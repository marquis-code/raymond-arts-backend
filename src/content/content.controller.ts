
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
    ParseIntPipe,
    DefaultValuePipe,
  } from "@nestjs/common"
  import { ContentService } from "./content.service"
  import { CreateContentDto } from "./dto/create-content.dto"
  import { UpdateContentDto } from "./dto/update-content.dto"
  import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
  import { RolesGuard } from "../auth/guards/roles.guard"
  import { Roles } from "../auth/decorators/roles.decorator"
  import { UserRole } from "../users/enums/user-role.enum"
  import { ContentType, ContentStatus, Content } from "./content.schema"
  import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
  
  @ApiTags("Content Management")
  @Controller("content")
  export class ContentController {
    constructor(private readonly contentService: ContentService) {}
  
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Create new content" })
    @ApiResponse({ status: 201, description: "Content created successfully", type: Content })
    async create(@Body() createContentDto: CreateContentDto, @Request() req): Promise<Content> {
      const userId = req.user.sub || req.user.id
      return this.contentService.create(createContentDto, userId)
    }
  
    @Get()
    @ApiOperation({ summary: "Get all content with optional filtering" })
    @ApiResponse({ status: 200, description: "Content retrieved successfully" })
    @ApiQuery({ name: "type", required: false, enum: ContentType })
    @ApiQuery({ name: "status", required: false, enum: ContentStatus })
    @ApiQuery({ name: "page", required: false, type: Number })
    @ApiQuery({ name: "limit", required: false, type: Number })
    async findAll(
      @Query("type") type?: ContentType,
      @Query("status") status?: ContentStatus,
      @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
      @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ) {
      return this.contentService.findAll({ type, status }, page, limit)
    }
  
    @Get("public")
    @ApiOperation({ summary: "Get all active/published content for public use" })
    @ApiResponse({ status: 200, description: "Public content retrieved successfully" })
    @ApiQuery({ name: "type", required: false, enum: ContentType })
    async findPublic(@Query("type") type?: ContentType) {
      return this.contentService.findPublic(type)
    }
  
    @Get("type/:type")
    @ApiOperation({ summary: "Get content by type" })
    @ApiResponse({ status: 200, description: "Content retrieved successfully" })
    @ApiParam({ name: "type", enum: ContentType })
    async findByType(@Param("type") type: ContentType): Promise<Content | null> {
      return this.contentService.findByType(type)
    }
  
    @Get(":id")
    @ApiOperation({ summary: "Get content by ID" })
    @ApiResponse({ status: 200, description: "Content retrieved successfully" })
    @ApiParam({ name: "id", description: "Content ID" })
    async findOne(@Param("id") id: string): Promise<Content> {
      return this.contentService.findOne(id)
    }
  
    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update content" })
    @ApiResponse({ status: 200, description: "Content updated successfully" })
    @ApiParam({ name: "id", description: "Content ID" })
    async update(@Param("id") id: string, @Body() updateContentDto: UpdateContentDto, @Request() req): Promise<Content> {
      const userId = req.user.sub || req.user.id
      return this.contentService.update(id, updateContentDto, userId)
    }
  
    @Patch(":id/status")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update content status" })
    @ApiResponse({ status: 200, description: "Content status updated successfully" })
    @ApiParam({ name: "id", description: "Content ID" })
    async updateStatus(@Param("id") id: string, @Body("status") status: ContentStatus, @Request() req): Promise<Content> {
      const userId = req.user.sub || req.user.id
      return this.contentService.updateStatus(id, status, userId)
    }
  
    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Delete content (Admin only)" })
    @ApiResponse({ status: 200, description: "Content deleted successfully" })
    @ApiParam({ name: "id", description: "Content ID" })
    async remove(@Param("id") id: string): Promise<{ message: string }> {
      await this.contentService.remove(id)
      return { message: "Content deleted successfully" }
    }
  
    @Post("seed")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Seed default content (Admin only)" })
    @ApiResponse({ status: 201, description: "Default content created successfully" })
    async seedContent(@Request() req): Promise<{ message: string; created: number }> {
      const userId = req.user.sub || req.user.id
      const result = await this.contentService.seedDefaultContent(userId)
      return result
    }
  }
  