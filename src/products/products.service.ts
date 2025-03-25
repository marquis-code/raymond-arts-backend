import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { Product } from "./schemas/product.schema"
import { Category } from "./schemas/category.schema"
import type { CreateProductDto } from "./dto/create-product.dto"
import type { UpdateProductDto } from "./dto/update-product.dto"
import type { CreateCategoryDto } from "./dto/create-category.dto"
import type { UpdateCategoryDto } from "./dto/update-category.dto"
import type { PaginationParams, PaginatedResult } from "../common/interfaces/pagination.interface"
import type { CloudinaryService } from "../cloudinary/cloudinary.service"
import type { AuditService } from "../audit/audit.service"
import type { InventoryService } from "../inventory/inventory.service"
import type { Express } from "express"

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private cloudinaryService: CloudinaryService,
    private auditService: AuditService,
    private inventoryService: InventoryService,
  ) {}

  // Product Methods
  async createProduct(createProductDto: CreateProductDto, userId: string): Promise<Product> {
    // Validate category if provided
    if (createProductDto.category) {
      const categoryExists = await this.categoryModel.findById(createProductDto.category).exec()
      if (!categoryExists) {
        throw new BadRequestException("Category not found")
      }
    }

    // Create product
    const newProduct = new this.productModel(createProductDto)
    const savedProduct = await newProduct.save()

    // Create inventory entry for the product
    await this.inventoryService.createInventoryItem({
      product: savedProduct._id.toString(),
      quantity: 0,
      lowStockThreshold: 5,
    })

    // Log audit
    await this.auditService.createAuditLog({
      action: "CREATE",
      userId,
      module: "PRODUCTS",
      description: `Product created: ${savedProduct.name}`,
      changes: JSON.stringify(createProductDto),
    })

    return savedProduct
  }

  async findAllProducts(params: PaginationParams): Promise<PaginatedResult<Product>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc", search } = params
    const skip = (page - 1) * limit

    // Build query
    let query = {}
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ],
      }
    }

    // Execute query
    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("category", "name")
        .exec(),
      this.productModel.countDocuments(query).exec(),
    ])

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findProductById(id: string): Promise<Product> {
    const product = await this.productModel
      .findById(id)
      .populate("category", "name")
      .populate("relatedProducts", "name price images")
      .exec()

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    // Increment view count
    product.viewCount += 1
    await product.save()

    return product
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<Product> {
    // Validate category if provided
    if (updateProductDto.category) {
      const categoryExists = await this.categoryModel.findById(updateProductDto.category).exec()
      if (!categoryExists) {
        throw new BadRequestException("Category not found")
      }
    }

    const product = await this.productModel.findById(id).exec()
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    const updatedProduct = await this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec()

    // Log audit
    await this.auditService.createAuditLog({
      action: "UPDATE",
      userId,
      module: "PRODUCTS",
      description: `Product updated: ${product.name}`,
      changes: JSON.stringify(updateProductDto),
    })

    return updatedProduct
  }

  async removeProduct(id: string, userId: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec()
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    // Instead of deleting, mark as unavailable
    product.isAvailable = false
    await product.save()

    // Log audit
    await this.auditService.createAuditLog({
      action: "DELETE",
      userId,
      module: "PRODUCTS",
      description: `Product marked as unavailable: ${product.name}`,
    })

    return product
  }

  async uploadProductImage(id: string, file: Express.Multer.File, userId: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec()
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    // Upload image to Cloudinary
    const result = await this.cloudinaryService.uploadFile(file, "products")

    // Add image to product
    if (!product.images) {
      product.images = []
    }

    product.images.push(result.secure_url)
    await product.save()

    // Log audit
    await this.auditService.createAuditLog({
      action: "UPDATE",
      userId,
      module: "PRODUCTS",
      description: `Image added to product: ${product.name}`,
    })

    return product
  }

  async removeProductImage(id: string, imageUrl: string, userId: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec()
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    // Remove image from product
    product.images = product.images.filter((img) => img !== imageUrl)
    await product.save()

    // Try to delete from Cloudinary if possible
    try {
      const publicId = imageUrl.split("/").pop().split(".")[0]
      await this.cloudinaryService.deleteFile(`products/${publicId}`)
    } catch (error) {
      // Continue even if Cloudinary deletion fails
      console.error("Failed to delete image from Cloudinary:", error)
    }

    // Log audit
    await this.auditService.createAuditLog({
      action: "UPDATE",
      userId,
      module: "PRODUCTS",
      description: `Image removed from product: ${product.name}`,
    })

    return product
  }

  async findFeaturedProducts(limit = 8): Promise<Product[]> {
    return this.productModel
      .find({ isFeatured: true, isAvailable: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("category", "name")
      .exec()
  }

  async findNewProducts(limit = 8): Promise<Product[]> {
    return this.productModel
      .find({ isNew: true, isAvailable: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("category", "name")
      .exec()
  }

  async findBestsellerProducts(limit = 8): Promise<Product[]> {
    return this.productModel
      .find({ isBestseller: true, isAvailable: true })
      .sort({ soldCount: -1 })
      .limit(limit)
      .populate("category", "name")
      .exec()
  }

  async findProductsByCategory(categoryId: string, params: PaginationParams): Promise<PaginatedResult<Product>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
    const skip = (page - 1) * limit

    // Get all subcategories
    const childCategories = await this.getAllChildCategories(categoryId)
    const categoryIds = [categoryId, ...childCategories.map((c) => c._id.toString())]

    // Execute query
    const [products, total] = await Promise.all([
      this.productModel
        .find({ category: { $in: categoryIds }, isAvailable: true })
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("category", "name")
        .exec(),
      this.productModel.countDocuments({ category: { $in: categoryIds }, isAvailable: true }).exec(),
    ])

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async searchProducts(query: string, params: PaginationParams): Promise<PaginatedResult<Product>> {
    const { page = 1, limit = 10 } = params
    const skip = (page - 1) * limit

    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
      isAvailable: true,
    }

    const [products, total] = await Promise.all([
      this.productModel
        .find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category", "name")
        .exec(),
      this.productModel.countDocuments(searchQuery).exec(),
    ])

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // Category Methods
  async createCategory(createCategoryDto: CreateCategoryDto, userId: string): Promise<Category> {
    // Validate parent category if provided
    if (createCategoryDto.parent) {
      const parentExists = await this.categoryModel.findById(createCategoryDto.parent).exec()
      if (!parentExists) {
        throw new BadRequestException("Parent category not found")
      }
    }

    const newCategory = new this.categoryModel(createCategoryDto)
    const savedCategory = await newCategory.save()

    // Log audit
    await this.auditService.createAuditLog({
      action: "CREATE",
      userId,
      module: "CATEGORIES",
      description: `Category created: ${savedCategory.name}`,
      changes: JSON.stringify(createCategoryDto),
    })

    return savedCategory
  }

  async findAllCategories(params: PaginationParams): Promise<PaginatedResult<Category>> {
    const { page = 1, limit = 10, sort = "order", order = "asc", search } = params
    const skip = (page - 1) * limit

    // Build query
    let query = {}
    if (search) {
      query = {
        name: { $regex: search, $options: "i" },
      }
    }

    // Execute query
    const [categories, total] = await Promise.all([
      this.categoryModel
        .find(query)
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("parent", "name")
        .exec(),
      this.categoryModel.countDocuments(query).exec(),
    ])

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findCategoryById(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).populate("parent", "name").exec()

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    return category
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto, userId: string): Promise<Category> {
    // Validate parent category if provided
    if (updateCategoryDto.parent) {
      // Prevent circular reference
      if (updateCategoryDto.parent === id) {
        throw new BadRequestException("Category cannot be its own parent")
      }

      const parentExists = await this.categoryModel.findById(updateCategoryDto.parent).exec()
      if (!parentExists) {
        throw new BadRequestException("Parent category not found")
      }

      // Check if the new parent is not a child of this category
      const childCategories = await this.getAllChildCategories(id)
      if (childCategories.some((c) => c._id.toString() === updateCategoryDto.parent)) {
        throw new BadRequestException("Cannot set a child category as parent")
      }
    }

    const category = await this.categoryModel.findById(id).exec()
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    const updatedCategory = await this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, { new: true }).exec()

    // Log audit
    await this.auditService.createAuditLog({
      action: "UPDATE",
      userId,
      module: "CATEGORIES",
      description: `Category updated: ${category.name}`,
      changes: JSON.stringify(updateCategoryDto),
    })

    return updatedCategory
  }

  async removeCategory(id: string, userId: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec()
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    // Check if category has products
    const productsCount = await this.productModel.countDocuments({ category: id }).exec()
    if (productsCount > 0) {
      throw new BadRequestException("Cannot delete category with associated products")
    }

    // Check if category has children
    const childrenCount = await this.categoryModel.countDocuments({ parent: id }).exec()
    if (childrenCount > 0) {
      throw new BadRequestException("Cannot delete category with child categories")
    }

    // Instead of deleting, mark as inactive
    category.isActive = false
    await category.save()

    // Log audit
    await this.auditService.createAuditLog({
      action: "DELETE",
      userId,
      module: "CATEGORIES",
      description: `Category marked as inactive: ${category.name}`,
    })

    return category
  }

  async uploadCategoryImage(id: string, file: Express.Multer.File, userId: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec()
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    // Upload image to Cloudinary
    const result = await this.cloudinaryService.uploadFile(file, "categories")

    // Update category image
    category.image = result.secure_url
    await category.save()

    // Log audit
    await this.auditService.createAuditLog({
      action: "UPDATE",
      userId,
      module: "CATEGORIES",
      description: `Image updated for category: ${category.name}`,
    })

    return category
  }

  async getCategoryTree(): Promise<any[]> {
    // Get all categories
    const categories = await this.categoryModel.find({ isActive: true }).exec()

    // Build tree
    const categoryMap = {}
    const rootCategories = []

    // Create map of categories
    categories.forEach((category) => {
      categoryMap[category._id.toString()] = {
        _id: category._id,
        name: category.name,
        description: category.description,
        image: category.image,
        order: category.order,
        children: [],
      }
    })

    // Build tree structure
    categories.forEach((category) => {
      if (category.parent) {
        const parentId = category.parent.toString()
        if (categoryMap[parentId]) {
          categoryMap[parentId].children.push(categoryMap[category._id.toString()])
        }
      } else {
        rootCategories.push(categoryMap[category._id.toString()])
      }
    })

    // Sort by order
    rootCategories.sort((a, b) => a.order - b.order)

    return rootCategories
  }

  private async getAllChildCategories(categoryId: string): Promise<Category[]> {
    const allCategories = await this.categoryModel.find().exec()
    const result: Category[] = []

    const findChildren = (parentId: string) => {
      const children = allCategories.filter((c) => c.parent && c.parent.toString() === parentId)

      children.forEach((child) => {
        result.push(child)
        findChildren(child._id.toString())
      })
    }

    findChildren(categoryId)
    return result
  }
}

