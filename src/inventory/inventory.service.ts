import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { Inventory } from "./schemas/inventory.schema"
import type { CreateInventoryDto } from "./dto/create-inventory.dto"
import type { UpdateInventoryDto } from "./dto/update-inventory.dto"
import type { InventoryHistoryDto } from "./dto/inventory-history.dto"
import type { PaginationParams, PaginatedResult } from "../common/interfaces/pagination.interface"
// import type { AuditService } from "../audit/audit.service"
import { AuditService } from "../audit/audit.service"
import { Types } from "mongoose"

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private readonly inventoryModel: Model<Inventory>,
    private auditService: AuditService,
  ) {}

  async createInventoryItem(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    // Check if inventory already exists for this product
    const existingInventory = await this.inventoryModel.findOne({ product: createInventoryDto.product }).exec()

    if (existingInventory) {
      throw new BadRequestException("Inventory already exists for this product")
    }

    const newInventory = new this.inventoryModel(createInventoryDto)
    return newInventory.save()
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Inventory>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
    const skip = (page - 1) * limit

    const [inventories, total] = await Promise.all([
      this.inventoryModel
        .find()
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("product", "name images price")
        .exec(),
      this.inventoryModel.countDocuments().exec(),
    ])

    return {
      data: inventories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // async findByProduct(productId: string): Promise<Inventory> {
  //   const inventory = await this.inventoryModel
  //     .findOne({ product: productId })
  //     .populate("product", "name images price")
  //     .exec()

  //   if (!inventory) {
  //     throw new NotFoundException(`Inventory for product ${productId} not found`)
  //   }

  //   return inventory
  // }

  // async findByProduct(productId: string): Promise<Inventory> {
  //   let inventory = await this.inventoryModel
  //     .findOne({ product: productId })
  //     .populate("product", "name images price")
  //     .exec()
  
  //   // If inventory doesn't exist, create it with default values
  //   if (!inventory) {
  //     inventory = new this.inventoryModel({
  //       product: productId,
  //       quantity: 0,
  //       lowStockThreshold: 5,
  //       isLowStock: false,
  //       isOutOfStock: true,
  //       history: []
  //     })
      
  //     inventory = await inventory.save()
      
  //     // Populate the product details after creation
  //     inventory = await this.inventoryModel
  //       .findById(inventory._id)
  //       .populate("product", "name images price")
  //       .exec()
  //   }
  
  //   return inventory
  // }

  // async findByProduct(productId: string): Promise<Inventory> {
  //   console.log(productId)
  //   // Convert string to ObjectId for proper comparison
  //   const objectId = new Types.ObjectId(productId)
    
  //   const inventory = await this.inventoryModel
  //     .findOne({ product: objectId })
  //     .populate("product", "name images price")
  //     .exec()
  
  //   if (!inventory) {
  //     throw new NotFoundException(`Inventory for product ${productId} not found`)
  //   }
  
  //   return inventory
  // }

  // async findByProduct(productId: string): Promise<Inventory> {
  //   // Validate ObjectId format first
  //   if (!Types.ObjectId.isValid(productId)) {
  //     throw new BadRequestException(`Invalid product ID format: ${productId}`)
  //   }
  
  //   const inventory = await this.inventoryModel
  //     .findOne({ product: new Types.ObjectId(productId) })
  //     .populate("product", "name images price")
  //     .exec()
  
  //   if (!inventory) {
  //     throw new NotFoundException(`Inventory for product ${productId} not found`)
  //   }
  
  //   return inventory
  // }

  async findByProduct(productId: string): Promise<Inventory> {
    console.log('=== DEBUGGING INVENTORY SEARCH ===')
    console.log('Input productId:', productId)
    console.log('Input type:', typeof productId)
    console.log('Input length:', productId.length)
    console.log('Trimmed productId:', productId.trim())
    console.log('Is valid ObjectId:', Types.ObjectId.isValid(productId))
    
    // Clean the productId
    const cleanProductId = productId.trim()
    
    if (!Types.ObjectId.isValid(cleanProductId)) {
      throw new BadRequestException(`Invalid product ID format: ${cleanProductId}`)
    }
  
    // Strategy 1: Direct ObjectId query
    console.log('--- Strategy 1: Direct ObjectId Query ---')
    try {
      const inventory1 = await this.inventoryModel
        .findOne({ product: new Types.ObjectId(cleanProductId) })
        .populate("product", "name images price")
        .exec()
      
      if (inventory1) {
        console.log('✅ Found with Strategy 1')
        return inventory1
      }
      console.log('❌ Not found with Strategy 1')
    } catch (error) {
      console.log('❌ Strategy 1 failed:', error.message)
    }
  
    // Strategy 2: String comparison
    console.log('--- Strategy 2: String Query ---')
    try {
      const inventory2 = await this.inventoryModel
        .findOne({ product: cleanProductId })
        .populate("product", "name images price")
        .exec()
      
      if (inventory2) {
        console.log('✅ Found with Strategy 2')
        return inventory2
      }
      console.log('❌ Not found with Strategy 2')
    } catch (error) {
      console.log('❌ Strategy 2 failed:', error.message)
    }
  
    // Strategy 3: Aggregation pipeline
    console.log('--- Strategy 3: Aggregation Pipeline ---')
    try {
      const inventory3 = await this.inventoryModel.aggregate([
        {
          $match: {
            product: new Types.ObjectId(cleanProductId)
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'product',
            pipeline: [
              {
                $project: {
                  name: 1,
                  images: 1,
                  price: 1
                }
              }
            ]
          }
        },
        {
          $unwind: '$product'
        }
      ])
  
      if (inventory3 && inventory3.length > 0) {
        console.log('✅ Found with Strategy 3')
        return inventory3[0] as Inventory
      }
      console.log('❌ Not found with Strategy 3')
    } catch (error) {
      console.log('❌ Strategy 3 failed:', error.message)
    }
  
    // Strategy 4: Find all and filter
    console.log('--- Strategy 4: Find All and Filter ---')
    try {
      const allInventories = await this.inventoryModel
        .find({})
        .populate("product", "name images price")
        .exec()
      
      console.log(`Found ${allInventories.length} total inventories`)
      
      const targetInventory = allInventories.find(inv => {
        const productIdStr = inv.product?._id?.toString() || inv.product?.toString()
        const matches = productIdStr === cleanProductId
        console.log(`Comparing: ${productIdStr} === ${cleanProductId} = ${matches}`)
        return matches
      })
  
      if (targetInventory) {
        console.log('✅ Found with Strategy 4')
        return targetInventory
      }
      console.log('❌ Not found with Strategy 4')
    } catch (error) {
      console.log('❌ Strategy 4 failed:', error.message)
    }
  
    // Strategy 5: Raw MongoDB query
    console.log('--- Strategy 5: Raw MongoDB Query ---')
    try {
      const rawResult = await this.inventoryModel.collection.findOne({
        product: new Types.ObjectId(cleanProductId)
      })
  
      if (rawResult) {
        console.log('✅ Found with Strategy 5 (raw)')
        // Convert to Mongoose document and populate
        const inventory5 = await this.inventoryModel
          .findById(rawResult._id)
          .populate("product", "name images price")
          .exec()
        
        if (inventory5) {
          return inventory5
        }
      }
      console.log('❌ Not found with Strategy 5')
    } catch (error) {
      console.log('❌ Strategy 5 failed:', error.message)
    }
  
    // Debug: Show what's actually in the database
    console.log('--- Database Debug Info ---')
    try {
      const sampleInventories = await this.inventoryModel.find({}).limit(3).exec()
      console.log('Sample inventories in database:')
      sampleInventories.forEach((inv, index) => {
        console.log(`  ${index + 1}. ID: ${inv._id}`)
        console.log(`     Product: ${inv.product}`)
        console.log(`     Product Type: ${typeof inv.product}`)
        console.log(`     Product String: ${inv.product.toString()}`)
      })
    } catch (error) {
      console.log('Failed to get debug info:', error.message)
    }
  
    throw new NotFoundException(`Inventory for product ${cleanProductId} not found after trying all strategies`)
  }
  

  async update(productId: string, updateInventoryDto: UpdateInventoryDto, userId: string): Promise<Inventory> {
    const inventory = await this.findByProduct(productId)

    // Update inventory
    if (updateInventoryDto.quantity !== undefined) {
      // Add to history if quantity changed
      if (updateInventoryDto.quantity !== inventory.quantity) {
        const action = updateInventoryDto.quantity > inventory.quantity ? "ADD" : "REMOVE"
        const quantityChange = Math.abs(updateInventoryDto.quantity - inventory.quantity)

        inventory.history.push({
          date: new Date(),
          action,
          quantity: quantityChange,
          notes: `Manual adjustment`,
          userId: new Types.ObjectId(userId),
        })

        // Log audit
        await this.auditService.createAuditLog({
          action: "UPDATE",
          userId,
          module: "INVENTORY",
          description: `Inventory quantity updated for product ${inventory.product}`,
          changes: JSON.stringify({
            from: inventory.quantity,
            to: updateInventoryDto.quantity,
          }),
        })
      }
    }

    // Apply updates
    Object.assign(inventory, updateInventoryDto)
    return inventory.save()
  }

  async addToHistory(productId: string, historyDto: InventoryHistoryDto, userId: string): Promise<Inventory> {
    const inventory = await this.findByProduct(productId)

    // Update quantity based on action
    if (historyDto.action === "ADD") {
      inventory.quantity += historyDto.quantity
    } else if (historyDto.action === "REMOVE") {
      if (inventory.quantity < historyDto.quantity) {
        throw new BadRequestException("Not enough inventory")
      }
      inventory.quantity -= historyDto.quantity
    } else {
      throw new BadRequestException("Invalid action")
    }

    // Add to history
    inventory.history.push({
      date: new Date(),
      action: historyDto.action,
      quantity: historyDto.quantity,
      notes: historyDto.notes,
      userId: new Types.ObjectId(userId),
    })

    // Log audit
    await this.auditService.createAuditLog({
      action: historyDto.action,
      userId,
      module: "INVENTORY",
      description: `Inventory ${historyDto.action.toLowerCase()} for product ${inventory.product}`,
      changes: JSON.stringify(historyDto),
    })

    return inventory.save()
  }

  async checkStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const inventory = await this.findByProduct(productId)
      return inventory.quantity >= quantity
    } catch (error) {
      return false
    }
  }

  // async reduceStock(productId: string, quantity: number, userId: string, notes = "Order placed"): Promise<boolean> {
  //   try {
  //     const inventory = await this.findByProduct(productId)

  //     if (inventory.quantity < quantity) {
  //       return false
  //     }

  //     inventory.quantity -= quantity

  //     // Add to history
  //     inventory.history.push({
  //       date: new Date(),
  //       action: "REMOVE",
  //       quantity,
  //       notes,
  //       userId: new Types.ObjectId(userId),
  //     })

  //     await inventory.save()

  //     // Log audit
  //     await this.auditService.createAuditLog({
  //       action: "REMOVE",
  //       userId,
  //       module: "INVENTORY",
  //       description: `Inventory reduced for product ${inventory.product}`,
  //       changes: JSON.stringify({ quantity, notes }),
  //     })

  //     return true
  //   } catch (error) {
  //     return false
  //   }
  // }

  async reduceStock(productId: string, quantity: number, userId: string, notes = "Order placed"): Promise<boolean> {
    // Remove the try-catch to let errors propagate
    const inventory = await this.findByProduct(productId)
  
    if (inventory.quantity < quantity) {
      throw new BadRequestException(`Insufficient stock. Available: ${inventory.quantity}, Requested: ${quantity}`)
    }
  
    inventory.quantity -= quantity
  
    // Add to history
    inventory.history.push({
      date: new Date(),
      action: "REMOVE",
      quantity,
      notes,
      userId: new Types.ObjectId(userId),
    })
  
    await inventory.save()
  
    // Log audit
    await this.auditService.createAuditLog({
      action: "REMOVE",
      userId,
      module: "INVENTORY",
      description: `Inventory reduced for product ${inventory.product}`,
      changes: JSON.stringify({ quantity, notes }),
    })
  
    return true
  }

  async restoreStock(productId: string, quantity: number, userId: string, notes = "Order cancelled"): Promise<boolean> {
    try {
      const inventory = await this.findByProduct(productId)

      inventory.quantity += quantity

      // Add to history
      inventory.history.push({
        date: new Date(),
        action: "ADD",
        quantity,
        notes,
        userId: new Types.ObjectId(userId),
      })

      await inventory.save()

      // Log audit
      await this.auditService.createAuditLog({
        action: "ADD",
        userId,
        module: "INVENTORY",
        description: `Inventory restored for product ${inventory.product}`,
        changes: JSON.stringify({ quantity, notes }),
      })

      return true
    } catch (error) {
      return false
    }
  }

  async findLowStock(threshold?: number): Promise<Inventory[]> {
    const query = threshold ? { quantity: { $gt: 0, $lte: threshold } } : { isLowStock: true }

    return this.inventoryModel.find(query).populate("product", "name images price").exec()
  }

  async findOutOfStock(): Promise<Inventory[]> {
    return this.inventoryModel.find({ quantity: 0 }).populate("product", "name images price").exec()
  }
}

