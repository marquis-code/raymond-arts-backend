import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { Order } from "./schemas/order.schema"
import type { CreateOrderDto } from "./dto/create-order.dto"
import type { UpdateOrderStatusDto } from "./dto/update-order-status.dto"
import { OrderStatus } from "./enums/order-status.enum"
import { PaymentStatus } from "./enums/payment-status.enum"
import { ProductsService } from "../products/products.service"
import { InventoryService } from "../inventory/inventory.service"
import { UsersService } from "../users/users.service"
import { EmailService } from "../email/email.service"
import { AuditService } from "../audit/audit.service"
import { NotificationsService } from "../notifications/notifications.service"
import { InvoicesService } from "../invoices/invoices.service"
import { ShippingTaxService } from "../shipping-tax/shipping-tax.service"
import type { PaginationParams, PaginatedResult } from "../common/interfaces/pagination.interface"
import { Types } from "mongoose"

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private productsService: ProductsService,
    private inventoryService: InventoryService,
    @Inject(forwardRef(() => InvoicesService)) private invoiceService: InvoicesService,
    private usersService: UsersService,
    private emailService: EmailService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
    private shippingTaxService: ShippingTaxService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    // Validate user
    const user = await this.usersService.findById(userId)

    // Generate order number
    const orderNumber = this.generateOrderNumber()

    // Process order items
    const orderItems = []
    let subtotal = 0

    for (const item of createOrderDto.items) {
      // Get product details
      const product = await this.productsService.findProductById(item.product)

      // Check if product is available
      if (!product.isAvailable) {
        throw new BadRequestException(`Product ${product.name} is not available`)
      }

      // Check inventory
      const hasStock = await this.inventoryService.checkStock(item.product, item.quantity)

      if (!hasStock) {
        throw new BadRequestException(`Not enough stock for ${product.name}`)
      }

      // Calculate item total
      const price = product.discountPrice > 0 ? product.discountPrice : product.price
      const total = price * item.quantity

      // Add to order items
      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        price,
        total,
      })

      // Add to subtotal
      subtotal += total
    }

    // Get country code from shipping address
    const countryCode = createOrderDto.shippingAddress.country || 'DEFAULT'
    
    // Get shipping rate based on country
    const shippingRate = await this.shippingTaxService.getShippingRate(countryCode)
    
    // Get VAT rate based on country
    const vatRate = await this.shippingTaxService.getVatRate(countryCode)
    
    // Calculate VAT amount (as percentage of subtotal)
    const vatAmount = subtotal * (vatRate / 100)
    
    // Calculate total with shipping and VAT
    const total = subtotal + shippingRate + vatAmount

    // Create order
    const newOrder = new this.orderModel({
      orderNumber,
      customer: userId,
      items: orderItems,
      subtotal,
      tax: vatAmount,
      taxRate: vatRate,
      shipping: shippingRate,
      total,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      shippingAddress: createOrderDto.shippingAddress,
      billingAddress: createOrderDto.billingAddress,
      notes: createOrderDto.notes,
      statusHistory: [
        {
          status: OrderStatus.PENDING,
          date: new Date(),
          notes: "Order created",
          userId,
        },
      ],
    })

    const savedOrder = await newOrder.save()

    // Reduce inventory
    for (const item of createOrderDto.items) {
      await this.inventoryService.reduceStock(item.product, item.quantity, userId, `Order #${orderNumber}`)
    }

    // Create invoice automatically
    await this.createInvoiceFromOrder(savedOrder, user._id.toString())

    // Send email notification
    await this.emailService.sendOrderConfirmation(savedOrder, user)

    // Send notification
    await this.notificationsService.createNotification({
      user: userId,
      title: "Order Placed",
      message: `Your order #${orderNumber} has been placed successfully.`,
      type: "order",
      reference: savedOrder._id.toString(),
    })

    // Send admin notification
    await this.notificationsService.createAdminNotification({
      title: "New Order",
      message: `New order #${orderNumber} has been placed by ${user.firstName} ${user.lastName}.`,
      type: "order",
      reference: savedOrder._id.toString(),
    })

    // Log audit
    await this.auditService.createAuditLog({
      action: "CREATE",
      userId,
      module: "ORDERS",
      description: `Order created: #${orderNumber}`,
    })

    return savedOrder
  }

  /**
   * Creates an invoice from an order
   */
  private async createInvoiceFromOrder(order: Order, userId: string): Promise<void> {
    // Map order items to invoice items
    const invoiceItems = order.items.map(item => ({
      description: `Product ID: ${item.product}`,
      quantity: item.quantity,
      price: item.price
    }))

    // Add shipping as an invoice item
    invoiceItems.push({
      description: 'Shipping and Handling',
      quantity: 1,
      price: order.shipping
    })

    // Set due date to 14 days from now
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14)

    // Create invoice using InvoiceService
    await this.invoiceService.create({
      customer: order.customer.toString(),
      order: order._id.toString(),
      items: invoiceItems,
      dueDate: dueDate.toISOString(),
      notes: `Invoice for order #${order.orderNumber}. Includes VAT at ${order.taxRate}%`,
      billingAddress: order.billingAddress
    }, userId)
  }


  // async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
  //   // Validate user
  //   const user = await this.usersService.findById(userId)

  //   // Generate order number
  //   const orderNumber = this.generateOrderNumber()

  //   // Process order items
  //   const orderItems = []
  //   let subtotal = 0

  //   for (const item of createOrderDto.items) {
  //     // Get product details
  //     const product = await this.productsService.findProductById(item.product)

  //     // Check if product is available
  //     if (!product.isAvailable) {
  //       throw new BadRequestException(`Product ${product.name} is not available`)
  //     }

  //     // Check inventory
  //     const hasStock = await this.inventoryService.checkStock(item.product, item.quantity)

  //     if (!hasStock) {
  //       throw new BadRequestException(`Not enough stock for ${product.name}`)
  //     }

  //     // Calculate item total
  //     const price = product.discountPrice > 0 ? product.discountPrice : product.price
  //     const total = price * item.quantity

  //     // Add to order items
  //     orderItems.push({
  //       product: item.product,
  //       quantity: item.quantity,
  //       price,
  //       total,
  //     })

  //     // Add to subtotal
  //     subtotal += total
  //   }

  //   // Calculate tax and shipping
  //   const tax = subtotal * 0.1 // 10% tax
  //   const shipping = subtotal > 100 ? 0 : 10 // Free shipping over $100
  //   const total = subtotal + tax + shipping

  //   // Create order
  //   const newOrder = new this.orderModel({
  //     orderNumber,
  //     customer: userId,
  //     items: orderItems,
  //     subtotal,
  //     tax,
  //     shipping,
  //     total,
  //     status: OrderStatus.PENDING,
  //     paymentStatus: PaymentStatus.PENDING,
  //     shippingAddress: createOrderDto.shippingAddress,
  //     billingAddress: createOrderDto.billingAddress,
  //     notes: createOrderDto.notes,
  //     statusHistory: [
  //       {
  //         status: OrderStatus.PENDING,
  //         date: new Date(),
  //         notes: "Order created",
  //         userId,
  //       },
  //     ],
  //   })

  //   const savedOrder = await newOrder.save()

  //   // Reduce inventory
  //   for (const item of createOrderDto.items) {
  //     await this.inventoryService.reduceStock(item.product, item.quantity, userId, `Order #${orderNumber}`)
  //   }

  //   // Send email notification
  //   await this.emailService.sendOrderConfirmation(savedOrder, user)

  //   // Send notification
  //   await this.notificationsService.createNotification({
  //     user: userId,
  //     title: "Order Placed",
  //     message: `Your order #${orderNumber} has been placed successfully.`,
  //     type: "order",
  //     reference: savedOrder._id.toString(),
  //   })

  //   // Send admin notification
  //   await this.notificationsService.createAdminNotification({
  //     title: "New Order",
  //     message: `New order #${orderNumber} has been placed by ${user.firstName} ${user.lastName}.`,
  //     type: "order",
  //     reference: savedOrder._id.toString(),
  //   })


  //       // Send admin notification
  //       await this.notificationsService.createAdminNotification({
  //         title: "New Order",
  //         message: `New order #${orderNumber} has been placed by ${user.firstName} ${user.lastName}.`,
  //         type: "order",
  //         reference: savedOrder._id.toString(),
  //       })

  //   // Log audit
  //   await this.auditService.createAuditLog({
  //     action: "CREATE",
  //     userId,
  //     module: "ORDERS",
  //     description: `Order created: #${orderNumber}`,
  //   })

  //   return savedOrder
  // }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Order>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc", search } = params
    const skip = (page - 1) * limit

    // Build query
    let query = {}
    if (search) {
      query = {
        $or: [
          { orderNumber: { $regex: search, $options: "i" } },
          { "shippingAddress.firstName": { $regex: search, $options: "i" } },
          { "shippingAddress.lastName": { $regex: search, $options: "i" } },
          { "shippingAddress.email": { $regex: search, $options: "i" } },
        ],
      }
    }

    // Execute query
    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("customer", "firstName lastName email")
        .populate("items.product", "name images")
        .exec(),
      this.orderModel.countDocuments(query).exec(),
    ])

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findByUser(userId: string, params: PaginationParams): Promise<PaginatedResult<Order>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      this.orderModel
        .find({ customer: userId })
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("items.product", "name images")
        .exec(),
      this.orderModel.countDocuments({ customer: userId }).exec(),
    ])

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // async findOne(id: string): Promise<Order> {
  //   const order = await this.orderModel
  //     .findById(id)
  //     .populate("customer", "firstName lastName email phone")
  //     .populate("items.product", "name images price discountPrice")
  //     .populate("transaction")
  //     .exec()

  //   if (!order) {
  //     throw new NotFoundException(`Order with ID ${id} not found`)
  //   }

  //   return order
  // }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate("customer", "_id") // Only populate the _id field of customer
      .populate("items.product", "name images price discountPrice")
      .populate("transaction")
      .exec()
  
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`)
    }
  
    return order
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderModel
      .findOne({ orderNumber })
      .populate("customer", "firstName lastName email phone")
      .populate("items.product", "name images price discountPrice")
      .populate("transaction")
      .exec()

    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`)
    }

    return order
  }

  // async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, userId: string): Promise<Order> {
  //   const order = await this.findOne(id)
  //   const oldStatus = order.status
  //   const newStatus = updateOrderStatusDto.status

  //   // Validate status transition
  //   this.validateStatusTransition(oldStatus, newStatus)

  //   // Update order status
  //   order.status = newStatus

  //   // Add to status history
  //   order.statusHistory.push({
  //     status: newStatus,
  //     date: new Date(),
  //     notes: updateOrderStatusDto.notes || `Status changed from ${oldStatus} to ${newStatus}`,
  //     userId: new Types.ObjectId(userId),
  //   })

  //   // Update tracking information if provided
  //   if (updateOrderStatusDto.trackingNumber) {
  //     order.trackingNumber = updateOrderStatusDto.trackingNumber
  //   }

  //   if (updateOrderStatusDto.trackingUrl) {
  //     order.trackingUrl = updateOrderStatusDto.trackingUrl
  //   }

  //   if (updateOrderStatusDto.estimatedDelivery) {
  //     order.estimatedDelivery = new Date(updateOrderStatusDto.estimatedDelivery)
  //   }

  //   // Update timestamps based on status
  //   if (newStatus === OrderStatus.SHIPPED && !order.shippedAt) {
  //     order.shippedAt = new Date()
  //   } else if (newStatus === OrderStatus.DELIVERED && !order.deliveredAt) {
  //     order.deliveredAt = new Date()
  //   } else if (newStatus === OrderStatus.CANCELLED && !order.cancelledAt) {
  //     order.cancelledAt = new Date()

  //     // Restore inventory
  //     for (const item of order.items) {
  //       await this.inventoryService.restoreStock(
  //         item.product.toString(),
  //         item.quantity,
  //         userId,
  //         `Order #${order.orderNumber} cancelled`,
  //       )
  //     }
  //   } else if (newStatus === OrderStatus.RETURNED && !order.returnedAt) {
  //     order.returnedAt = new Date()

  //     // Restore inventory
  //     for (const item of order.items) {
  //       await this.inventoryService.restoreStock(
  //         item.product.toString(),
  //         item.quantity,
  //         userId,
  //         `Order #${order.orderNumber} returned`,
  //       )
  //     }
  //   } else if (newStatus === OrderStatus.REFUNDED && !order.refundedAt) {
  //     order.refundedAt = new Date()
  //     order.paymentStatus = PaymentStatus.REFUNDED
  //   }

  //   const updatedOrder = await order.save()

  //   // Send notification to customer
  //   const customer = await this.usersService.findById(order.customer.toString())

  //   await this.notificationsService.createNotification({
  //     user: customer._id.toString(),
  //     title: "Order Status Updated",
  //     message: `Your order #${order.orderNumber} status has been updated to ${newStatus}.`,
  //     type: "order",
  //     reference: order._id.toString(),
  //   })

  //   // Log audit
  //   await this.auditService.createAuditLog({
  //     action: "UPDATE",
  //     userId,
  //     module: "ORDERS",
  //     description: `Order #${order.orderNumber} status updated from ${oldStatus} to ${newStatus}`,
  //     changes: JSON.stringify(updateOrderStatusDto),
  //   })

  //   return updatedOrder
  // }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, userId: string): Promise<Order> {
    const order = await this.findOne(id) as any
    const oldStatus = order.status
    const newStatus = updateOrderStatusDto.status
  
    // Validate status transition
    this.validateStatusTransition(oldStatus, newStatus)
  
    // Update order status
    order.status = newStatus
  
    // Add to status history with proper error handling for ObjectId
    let userObjectId;
    try {
      userObjectId = userId ? new Types.ObjectId(userId) : null;
    } catch (error) {
      console.warn(`Invalid userId format: ${userId}. Using null instead.`);
      userObjectId = null;
    }
  
    order.statusHistory.push({
      status: newStatus,
      date: new Date(),
      notes: updateOrderStatusDto.notes || `Status changed from ${oldStatus} to ${newStatus}`,
      userId: userObjectId,
    });
  
    // Update tracking information if provided
    if (updateOrderStatusDto.trackingNumber) {
      order.trackingNumber = updateOrderStatusDto.trackingNumber
    }
  
    if (updateOrderStatusDto.trackingUrl) {
      order.trackingUrl = updateOrderStatusDto.trackingUrl
    }
  
    if (updateOrderStatusDto.estimatedDelivery) {
      order.estimatedDelivery = new Date(updateOrderStatusDto.estimatedDelivery)
    }
  
    // Update timestamps based on status
    if (newStatus === OrderStatus.SHIPPED && !order.shippedAt) {
      order.shippedAt = new Date()
    } else if (newStatus === OrderStatus.DELIVERED && !order.deliveredAt) {
      order.deliveredAt = new Date()
    } else if (newStatus === OrderStatus.CANCELLED && !order.cancelledAt) {
      order.cancelledAt = new Date()
  
      // Restore inventory
      for (const item of order.items) {
        await this.inventoryService.restoreStock(
          item.product.toString(),
          item.quantity,
          userId,
          `Order #${order.orderNumber} cancelled`,
        )
      }
    } else if (newStatus === OrderStatus.RETURNED && !order.returnedAt) {
      order.returnedAt = new Date()
  
      // Restore inventory
      for (const item of order.items) {
        await this.inventoryService.restoreStock(
          item.product.toString(),
          item.quantity,
          userId,
          `Order #${order.orderNumber} returned`,
        )
      }
    } else if (newStatus === OrderStatus.REFUNDED && !order.refundedAt) {
      order.refundedAt = new Date()
      order.paymentStatus = PaymentStatus.REFUNDED
    }
  
    const updatedOrder = await order.save()
  
    // Extract the customer ID correctly
    let customerId: string;
    
    // Check if customer is a populated object or just an ID
    if (order.customer) {
      if (typeof order.customer === 'object') {
        // If it's a populated object with _id
        if (order.customer._id) {
          customerId = order.customer._id.toString();
        } 
        // If it's a Mongoose ObjectId
        else if (order.customer instanceof Types.ObjectId) {
          customerId = order.customer.toString();
        }
        // If it's a string representation of an object, try to extract the ID
        else if (typeof order.customer.toString === 'function') {
          const customerStr = order.customer.toString();
          // Try to extract the ObjectId from the string
          const match = customerStr.match(/ObjectId$$'([0-9a-fA-F]{24})'$$/);
          if (match && match[1]) {
            customerId = match[1];
          } else {
            console.error('Could not extract customer ID from:', customerStr);
            // Skip notification if we can't get a valid customer ID
            return updatedOrder;
          }
        }
      } else {
        // If it's already a string
        customerId = order.customer.toString();
      }
    } else {
      console.error('Order has no customer:', order);
      // Skip notification if there's no customer
      return updatedOrder;
    }
  
    // Now use the extracted customerId
    try {
      const customer = await this.usersService.findById(customerId);
      
      // Send notification to customer
      await this.notificationsService.createNotification({
        user: customer._id.toString(),
        title: "Order Status Updated",
        message: `Your order #${order.orderNumber} status has been updated to ${newStatus}.`,
        type: "order",
        reference: order._id.toString(),
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      // Continue even if notification fails
    }
  
    // Log audit
    await this.auditService.createAuditLog({
      action: "UPDATE",
      userId,
      module: "ORDERS",
      description: `Order #${order.orderNumber} status updated from ${oldStatus} to ${newStatus}`,
      changes: JSON.stringify(updateOrderStatusDto),
    });
  
    return updatedOrder;
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    transactionId: string,
    userId: string,
  ): Promise<Order> {
    const order = await this.findOne(id)
    const oldPaymentStatus = order.paymentStatus

    // Update payment status
    order.paymentStatus = paymentStatus
   order.transaction = new Types.ObjectId(transactionId)

    // If payment is successful, update order status to processing
    if (paymentStatus === PaymentStatus.PAID && order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.PROCESSING

      // Add to status history
      order.statusHistory.push({
        status: OrderStatus.PROCESSING,
        date: new Date(),
        notes: "Payment received, order processing",
        userId: new Types.ObjectId(userId),
        // userId,
      })
    }

    const updatedOrder = await order.save()

    // Send notification to customer
    const customer = await this.usersService.findById(order.customer.toString())

    await this.notificationsService.createNotification({
      user: customer._id.toString(),
      title: "Payment Status Updated",
      message: `Payment for your order #${order.orderNumber} has been ${paymentStatus}.`,
      type: "payment",
      reference: order._id.toString(),
    })

    // Log audit
    await this.auditService.createAuditLog({
      action: "UPDATE",
      userId,
      module: "ORDERS",
      description: `Order #${order.orderNumber} payment status updated from ${oldPaymentStatus} to ${paymentStatus}`,
      changes: JSON.stringify({ paymentStatus, transactionId }),
    })

    return updatedOrder
  }

  private generateOrderNumber(): string {
    const prefix = "ORD"
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${prefix}-${timestamp}-${random}`
  }

  // private validateStatusTransition(oldStatus: OrderStatus, newStatus: OrderStatus): void {
  //   // Define valid transitions
  //   const validTransitions = {
  //     [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  //     [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  //     [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
  //     [OrderStatus.DELIVERED]: [OrderStatus.RETURNED, OrderStatus.REFUNDED],
  //     [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
  //     [OrderStatus.CANCELLED]: [],
  //     [OrderStatus.REFUNDED]: [],
  //   }

  //   // Check if transition is valid
  //   if (!validTransitions[oldStatus].includes(newStatus) && oldStatus !== newStatus) {
  //     throw new BadRequestException(`Invalid status transition from ${oldStatus} to ${newStatus}`)
  //   }
  // }

  private validateStatusTransition(oldStatus: OrderStatus, newStatus: OrderStatus): void {
    // Define valid transitions
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
      [OrderStatus.DELIVERED]: [OrderStatus.RETURNED, OrderStatus.REFUNDED],
      [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    }
  
    // Check if transition is valid
    if (!validTransitions[oldStatus].includes(newStatus) && oldStatus !== newStatus) {
      throw new BadRequestException(`Invalid status transition from ${oldStatus} to ${newStatus}`)
    }
  }

  async getOrderStatistics(): Promise<any> {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
    ] = await Promise.all([
      this.orderModel.countDocuments().exec(),
      this.orderModel.countDocuments({ status: OrderStatus.PENDING }).exec(),
      this.orderModel.countDocuments({ status: OrderStatus.PROCESSING }).exec(),
      this.orderModel.countDocuments({ status: OrderStatus.SHIPPED }).exec(),
      this.orderModel.countDocuments({ status: OrderStatus.DELIVERED }).exec(),
      this.orderModel.countDocuments({ status: OrderStatus.CANCELLED }).exec(),
      this.orderModel.countDocuments({ createdAt: { $gte: startOfDay } }).exec(),
      this.orderModel.countDocuments({ createdAt: { $gte: startOfWeek } }).exec(),
      this.orderModel.countDocuments({ createdAt: { $gte: startOfMonth } }).exec(),
      this.orderModel
        .aggregate([
          { $match: { paymentStatus: PaymentStatus.PAID } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ])
        .exec(),
      this.orderModel
        .aggregate([
          { $match: { paymentStatus: PaymentStatus.PAID, createdAt: { $gte: startOfDay } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ])
        .exec(),
      this.orderModel
        .aggregate([
          { $match: { paymentStatus: PaymentStatus.PAID, createdAt: { $gte: startOfWeek } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ])
        .exec(),
      this.orderModel
        .aggregate([
          { $match: { paymentStatus: PaymentStatus.PAID, createdAt: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ])
        .exec(),
    ])

    return {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        today: todayOrders,
        week: weekOrders,
        month: monthOrders,
      },
      revenue: {
        total: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        today: todayRevenue.length > 0 ? todayRevenue[0].total : 0,
        week: weekRevenue.length > 0 ? weekRevenue[0].total : 0,
        month: monthRevenue.length > 0 ? monthRevenue[0].total : 0,
      },
    }
  }

  async getRecentOrders(limit = 10): Promise<Order[]> {
    return this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("customer", "firstName lastName email")
      .exec()
  }
}

