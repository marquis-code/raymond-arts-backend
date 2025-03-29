import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from "@nestjs/common"
import { ContactsService } from "./contacts.service"
import type { CreateContactDto } from "./dto/create-contact.dto"
import type { UpdateContactDto } from "./dto/update-contact.dto"
import type { AddInteractionDto } from "./dto/add-interaction.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/enums/user-role.enum"
import type { PaginationDto } from "../common/dto/pagination.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from "@nestjs/swagger"

@ApiTags("Contacts")
@Controller("contacts")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new contact" })
  @ApiResponse({ status: 201, description: "Contact created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 409, description: "Contact with this email already exists" })
  create(@Body() createContactDto: CreateContactDto, @Request() req) {
    return this.contactsService.create(createContactDto, req.user.sub)
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Get all contacts" })
  @ApiResponse({ status: 200, description: "Contacts retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.contactsService.findAll(paginationDto)
  }

  @Get("my-contacts")
  @ApiOperation({ summary: "Get current user contacts" })
  @ApiResponse({ status: 200, description: "Contacts retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findMyContacts(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.contactsService.findByUser(req.user.sub, paginationDto)
  }

  @Get("tags")
  @ApiOperation({ summary: "Get all tags" })
  @ApiResponse({ status: 200, description: "Tags retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getAllTags() {
    return this.contactsService.getAllTags()
  }

  @Get("tag/:tag")
  @ApiOperation({ summary: "Get contacts by tag" })
  @ApiResponse({ status: 200, description: "Contacts retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiParam({ name: "tag", description: "Tag" })
  findByTag(@Param("tag") tag: string, @Query() paginationDto: PaginationDto) {
    return this.contactsService.findByTag(tag, paginationDto)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a contact by ID" })
  @ApiResponse({ status: 200, description: "Contact retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Contact not found" })
  @ApiParam({ name: "id", description: "Contact ID" })
  findOne(@Param("id") id: string) {
    return this.contactsService.findOne(id)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a contact" })
  @ApiResponse({ status: 200, description: "Contact updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Contact not found" })
  @ApiResponse({ status: 409, description: "Contact with this email already exists" })
  @ApiParam({ name: "id", description: "Contact ID" })
  update(@Param("id") id: string, @Body() updateContactDto: UpdateContactDto, @Request() req) {
    return this.contactsService.update(id, updateContactDto, req.user.sub)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a contact" })
  @ApiResponse({ status: 200, description: "Contact deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Contact not found" })
  @ApiParam({ name: "id", description: "Contact ID" })
  remove(@Param("id") id: string, @Request() req) {
    return this.contactsService.remove(id, req.user.sub)
  }

  @Post(":id/interactions")
  @ApiOperation({ summary: "Add an interaction to a contact" })
  @ApiResponse({ status: 201, description: "Interaction added successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Contact not found" })
  @ApiParam({ name: "id", description: "Contact ID" })
  addInteraction(@Param("id") id: string, @Body() addInteractionDto: AddInteractionDto, @Request() req) {
    return this.contactsService.addInteraction(id, addInteractionDto, req.user.sub)
  }
}

