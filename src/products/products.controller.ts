import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import type { ProductsService } from "./products.service"
import type { CreateProductDto } from "./dto/create-product.dto"
import type { UpdateProductDto } from "./dto/update-product.dto"
import type { CreateCategoryDto } from "./dto/create-category.dto"
import type { UpdateCategoryDto } from "./dto/update-category.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/enums/user-role.enum"
import type { PaginationDto } from "../common/dto/pagination.dto"
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger"
import type { Express } from "express"

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Product endpoints
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new product" })
  @ApiResponse({ status: 201, description: "Product created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.createProduct(createProductDto, req.user.sub)
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAllProducts(paginationDto);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiResponse({ status: 200, description: 'Featured products retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getFeatured(@Query('limit') limit: number) {
    return this.productsService.findFeaturedProducts(limit);
  }

  @Get('new')
  @ApiOperation({ summary: 'Get new products' })
  @ApiResponse({ status: 200, description: 'New products retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getNew(@Query('limit') limit: number) {
    return this.productsService.findNewProducts(limit);
  }

  @Get('bestsellers')
  @ApiOperation({ summary: 'Get bestseller products' })
  @ApiResponse({ status: 200, description: 'Bestseller products retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getBestsellers(@Query('limit') limit: number) {
    return this.productsService.findBestsellerProducts(limit);
  }

  @Get("search")
  @ApiOperation({ summary: "Search products" })
  @ApiResponse({ status: 200, description: "Search results retrieved successfully" })
  @ApiQuery({ name: "q", required: true, type: String })
  search(@Query('q') query: string, @Query() paginationDto: PaginationDto) {
    return this.productsService.searchProducts(query, paginationDto)
  }

  @Get("category/:id")
  @ApiOperation({ summary: "Get products by category" })
  @ApiResponse({ status: 200, description: "Products retrieved successfully" })
  @ApiResponse({ status: 404, description: "Category not found" })
  @ApiParam({ name: "id", description: "Category ID" })
  findByCategory(@Param('id') id: string, @Query() paginationDto: PaginationDto) {
    return this.productsService.findProductsByCategory(id, paginationDto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findProductById(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a product" })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Product not found" })
  @ApiParam({ name: "id", description: "Product ID" })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req) {
    return this.productsService.updateProduct(id, updateProductDto, req.user.sub)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a product" })
  @ApiResponse({ status: 200, description: "Product deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Product not found" })
  @ApiParam({ name: "id", description: "Product ID" })
  remove(@Param('id') id: string, @Request() req) {
    return this.productsService.removeProduct(id, req.user.sub)
  }

  @Post(":id/images")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiOperation({ summary: "Upload product image" })
  @ApiResponse({ status: 200, description: "Image uploaded successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Product not found" })
  @ApiParam({ name: "id", description: "Product ID" })
  uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Request() req) {
    return this.productsService.uploadProductImage(id, file, req.user.sub)
  }

  @Delete(":id/images")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove product image" })
  @ApiResponse({ status: 200, description: "Image removed successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Product not found" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiQuery({ name: "imageUrl", required: true, type: String })
  removeImage(@Param('id') id: string, @Query('imageUrl') imageUrl: string, @Request() req) {
    return this.productsService.removeProductImage(id, imageUrl, req.user.sub)
  }

  // Category endpoints
  @Post("categories")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new category" })
  @ApiResponse({ status: 201, description: "Category created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  createCategory(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    return this.productsService.createCategory(createCategoryDto, req.user.sub)
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  findAllCategories(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAllCategories(paginationDto);
  }

  @Get("categories/tree")
  @ApiOperation({ summary: "Get category tree" })
  @ApiResponse({ status: 200, description: "Category tree retrieved successfully" })
  getCategoryTree() {
    return this.productsService.getCategoryTree()
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  findOneCategory(@Param('id') id: string) {
    return this.productsService.findCategoryById(id);
  }

  @Patch("categories/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a category" })
  @ApiResponse({ status: 200, description: "Category updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Category not found" })
  @ApiParam({ name: "id", description: "Category ID" })
  updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Request() req) {
    return this.productsService.updateCategory(id, updateCategoryDto, req.user.sub)
  }

  @Delete("categories/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a category" })
  @ApiResponse({ status: 200, description: "Category deleted successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Category not found" })
  @ApiParam({ name: "id", description: "Category ID" })
  removeCategory(@Param('id') id: string, @Request() req) {
    return this.productsService.removeCategory(id, req.user.sub)
  }

  @Post("categories/:id/image")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiOperation({ summary: "Upload category image" })
  @ApiResponse({ status: 200, description: "Image uploaded successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Category not found" })
  @ApiParam({ name: "id", description: "Category ID" })
  uploadCategoryImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Request() req) {
    return this.productsService.uploadCategoryImage(id, file, req.user.sub)
  }
}

