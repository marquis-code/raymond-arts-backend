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
    @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,
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

  async findByProduct(productId: string): Promise<Inventory> {
    const inventory = await this.inventoryModel
      .findOne({ product: productId })
      .populate("product", "name images price")
      .exec()

    if (!inventory) {
      throw new NotFoundException(`Inventory for product ${productId} not found`)
    }

    return inventory
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

  async reduceStock(productId: string, quantity: number, userId: string, notes = "Order placed"): Promise<boolean> {
    try {
      const inventory = await this.findByProduct(productId)

      if (inventory.quantity < quantity) {
        return false
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
    } catch (error) {
      return false
    }
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

