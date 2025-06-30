
// import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from "@nestjs/common"
// import { Model } from "mongoose"
// import { InjectModel } from '@nestjs/mongoose';
// import { Order, OrderStatus, PaymentStatus, PaymentType } from "./schemas/order.schema"
// import { CreateOrderDto } from "./dto/create-order.dto"
// import { UpdateOrderStatusDto } from "./dto/update-order-status.dto"
// import { UpdatePaymentStatusDto } from "./dto/update-payment-status.dto"
// import { CreateInstallmentOrderDto } from "./dto/create-installment-order.dto"
// import { ProductsService } from "../products/products.service"
// import { InventoryService } from "../inventory/inventory.service"
// import { UsersService } from "../users/users.service"
// import { EmailService } from "../email/email.service"
// import { AuditService } from "../audit/audit.service"
// import { NotificationsService } from "../notifications/notifications.service"
// import { InvoicesService } from "../invoices/invoices.service"
// import { ShippingTaxService } from "../shipping-tax/shipping-tax.service"
// import { InstallmentsService } from "../installments/installments.service"
// import { PaymentsService } from "../payments/payments.service"
// import { PaginationParams, PaginatedResult } from "../common/interfaces/pagination.interface"
// import { Types } from "mongoose"
// import { SalesService } from "src/sales/sales.service"

// // Import the PaymentStatus from the enum file for DTO comparison
// import { PaymentStatus as PaymentStatusEnum } from "./enums/payment-status.enum"

// @Injectable()
// export class OrdersService {
//   private inventoryService: InventoryService
//   private productsService: ProductsService
//   private invoiceService: InvoicesService
//   private usersService: UsersService
//   private emailService: EmailService
//   private auditService: AuditService
//   private notificationsService: NotificationsService
//   private shippingTaxService: ShippingTaxService
//   private installmentsService: InstallmentsService
//   private paymentsService: PaymentsService
//   private salesService: SalesService

//   constructor(
//     @InjectModel(Order.name) private orderModel: Model<Order>,
//     productsService: ProductsService,
//     inventoryService: InventoryService,
//     invoiceService: InvoicesService,
//     usersService: UsersService,
//     emailService: EmailService,
//     auditService: AuditService,
//     notificationsService: NotificationsService,
//     shippingTaxService: ShippingTaxService,
//     installmentsService: InstallmentsService,
//     @Inject(forwardRef(() => PaymentsService))
//     paymentsService: PaymentsService,
//     salesService: SalesService,
//   ) {
//     this.orderModel = orderModel
//     this.productsService = productsService
//     this.inventoryService = inventoryService
//     this.invoiceService = invoiceService
//     this.usersService = usersService
//     this.emailService = emailService
//     this.auditService = auditService
//     this.notificationsService = notificationsService
//     this.shippingTaxService = shippingTaxService
//     this.installmentsService = installmentsService
//     this.paymentsService = paymentsService
//     this.salesService = salesService
//   }

//   async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
//     console.log('=== STARTING ORDER CREATION ===')
//     console.log('User ID:', userId)
//     console.log('Order items:', createOrderDto.items)
//     console.log('Payment type:', createOrderDto.paymentType || PaymentType.FULL)
  
//     // Validate user
//     const user = await this.usersService.findById(userId)
  
//     // Generate order number
//     const orderNumber = this.generateOrderNumber()
  
//     // Process order items - Pre-validate everything first
//     const orderItems = []
//     const inventoryMap = new Map<string, any>()
//     let subtotal = 0
  
//     console.log('=== PRE-VALIDATION PHASE ===')
//     for (let i = 0; i < createOrderDto.items.length; i++) {
//       const item = createOrderDto.items[i]
//       console.log(`\n--- Processing Item ${i + 1}: ${item.product} ---`)
  
//       try {
//         // Get product details
//         console.log('1. Fetching product details...')
//         const product = await this.productsService.findProductById(item.product)
//         console.log(`✅ Found product: ${product.name}`)
  
//         // Check if product is available
//         if (!product.isAvailable) {
//           throw new BadRequestException(`Product ${product.name} is not available`)
//         }
  
//         // Get inventory for this product with retry logic
//         console.log('2. Fetching inventory...')
//         let inventory = null
//         let retryCount = 0
//         const maxRetries = 3
  
//         while (!inventory && retryCount < maxRetries) {
//           try {
//             inventory = await this.inventoryService.findByProduct(item.product)
//             console.log(`✅ Found inventory on attempt ${retryCount + 1}`)
//             break
//           } catch (error) {
//             retryCount++
//             console.log(`❌ Inventory fetch attempt ${retryCount} failed: ${error.message}`)
            
//             if (retryCount < maxRetries) {
//               console.log(`Retrying in 1 second...`)
//               await new Promise(resolve => setTimeout(resolve, 1000))
//             } else {
//               console.log(`All ${maxRetries} attempts failed`)
//               throw error
//             }
//           }
//         }
  
//         // Store inventory for later use
//         inventoryMap.set(item.product, inventory)
  
//         // Check if we have enough stock
//         if (inventory.quantity < item.quantity) {
//           throw new BadRequestException(
//             `Not enough stock for ${product.name}. Available: ${inventory.quantity}, Requested: ${item.quantity}`,
//           )
//         }
  
//         // Check if product is out of stock
//         if (inventory.isOutOfStock) {
//           throw new BadRequestException(`Product ${product.name} is out of stock`)
//         }
  
//         // Calculate item total
//         const price = product.discountPrice > 0 ? product.discountPrice : product.price
//         const itemDiscount = item.discount || 0
//         const discountedPrice = price - (price * itemDiscount / 100)
//         const total = discountedPrice * item.quantity
  
//         // Add to order items
//         orderItems.push({
//           product: item.product,
//           quantity: item.quantity,
//           price: discountedPrice,
//           size: item.size,
//           color: item.color,
//           discount: itemDiscount,
//           total,
//         })
  
//         // Add to subtotal
//         subtotal += total
  
//         console.log(`✅ Item ${i + 1} validated successfully`)
//       } catch (error) {
//         console.error(`❌ Error processing item ${i + 1}:`, error.message)
//         throw error
//       }
//     }
  
//     console.log('=== ALL ITEMS PRE-VALIDATED SUCCESSFULLY ===')
  
//     // Get country code from shipping address
//     const countryCode = createOrderDto.shippingAddress.country || "DEFAULT"
  
//     // Get shipping rate based on country
//     const shippingRate = await this.shippingTaxService.getShippingRate(countryCode)
  
//     // Get VAT rate based on country
//     const vatRate = await this.shippingTaxService.getVatRate(countryCode)
  
//     // Calculate VAT amount (as percentage of subtotal)
//     const vatAmount = subtotal * (vatRate / 100)
  
//     // Apply order-level discount if provided
//     const orderDiscount = createOrderDto.discount || 0
//     const discountAmount = subtotal * (orderDiscount / 100)
//     const discountedSubtotal = subtotal - discountAmount
  
//     // Calculate total with shipping and VAT
//     const total = discountedSubtotal + shippingRate + vatAmount
  
//     // FIXED: Initialize payment status and paid amount based on payment type
//     let initialPaymentStatus = PaymentStatus.PENDING
//     let initialPaidAmount = 0
//     let installmentInfo = null
  
//     // Handle installment information if payment type is installment
//     if (createOrderDto.paymentType === PaymentType.INSTALLMENT && createOrderDto.installmentInfo) {
//       console.log('=== PROCESSING INSTALLMENT ORDER ===')
      
//       // Validate installment plan if provided
//       if (createOrderDto.installmentInfo.installmentPlan) {
//         try {
//           // Check if the service has the method we need
//           if (this.installmentsService && typeof this.installmentsService.getInstallmentPlan === 'function') {
//             const installmentPlan = await this.installmentsService.getInstallmentPlan(
//               createOrderDto.installmentInfo.installmentPlan.toString(),
//               userId
//             )
            
//             if (installmentPlan && typeof installmentPlan === 'object' && installmentPlan !== null) {
//               if ('status' in installmentPlan && installmentPlan.status !== 'active') {
//                 throw new BadRequestException('Selected installment plan is not active')
//               }
//               console.log('✅ Installment plan validated')
//             }
//           } else {
//             console.warn('InstallmentsService.getInstallmentPlan method not available, skipping validation')
//           }
//         } catch (error) {
//           console.error('Error validating installment plan:', error.message)
//           if (error instanceof BadRequestException) {
//             throw error
//           }
//           // For other errors, just log and continue
//           console.warn('Installment plan validation failed, continuing with order creation')
//         }
//       }
      
//       // FIXED: Calculate installment details properly
//       const downPayment = createOrderDto.installmentInfo.downPayment
//       const numberOfInstallments = createOrderDto.installmentInfo.numberOfInstallments
//       const interestRate = createOrderDto.installmentInfo.interestRate || 0
      
//       // Validate down payment amount
//       if (downPayment < 0 || downPayment > total) {
//         throw new BadRequestException('Invalid down payment amount')
//       }
      
//       // Calculate remaining amount after down payment
//       const remainingAmount = total - downPayment
      
//       // Calculate installment amount with interest
//       let installmentAmount: number
//       let totalInterest: number
//       let totalPayable: number
      
//       if (interestRate > 0) {
//         const monthlyInterestRate = interestRate / 12 / 100
//         const factor = Math.pow(1 + monthlyInterestRate, numberOfInstallments)
//         installmentAmount = (remainingAmount * monthlyInterestRate * factor) / (factor - 1)
//         totalInterest = installmentAmount * numberOfInstallments - remainingAmount
//         totalPayable = downPayment + installmentAmount * numberOfInstallments
//       } else {
//         installmentAmount = remainingAmount / numberOfInstallments
//         totalInterest = 0
//         totalPayable = total // No interest, so total payable equals original total
//       }
      
//       installmentInfo = {
//         isInstallment: true,
//         installmentPlan: createOrderDto.installmentInfo.installmentPlan,
//         numberOfInstallments,
//         downPayment,
//         installmentAmount,
//         interestRate,
//         totalPayable,
//         totalInterest,
//         remainingAmount: installmentAmount * numberOfInstallments, // Amount still to be paid in installments
//         paymentFrequency: createOrderDto.installmentInfo.paymentFrequency || 'monthly',
//         paymentMethod: createOrderDto.installmentInfo.paymentMethod,
//       }
      
//       // FIXED: For installment orders, if down payment > 0, set as partially paid
//       if (downPayment > 0) {
//         initialPaymentStatus = PaymentStatus.PARTIALLY_PAID
//         initialPaidAmount = downPayment
//       }
      
//       console.log('✅ Installment info processed:', {
//         downPayment,
//         installmentAmount,
//         totalPayable,
//         remainingAmount: installmentAmount * numberOfInstallments
//       })
//     }
  
//     console.log('=== CREATING ORDER DOCUMENT ===')
//     // Create order
//     const newOrder = new this.orderModel({
//       orderNumber,
//       customer: userId,
//       items: orderItems,
//       subtotal: discountedSubtotal,
//       tax: vatAmount,
//       taxRate: vatRate,
//       shipping: shippingRate,
//       discount: orderDiscount,
//       total,
//       status: OrderStatus.PENDING,
//       paymentStatus: initialPaymentStatus, // FIXED: Use calculated payment status
//       paymentType: createOrderDto.paymentType || PaymentType.FULL,
//       installmentInfo,
//       shippingAddress: createOrderDto.shippingAddress,
//       billingAddress: createOrderDto.billingAddress,
//       notes: createOrderDto.notes,
//       paidAmount: initialPaidAmount, // FIXED: Use calculated paid amount
//       refundedAmount: 0,
//       paymentMethod: createOrderDto.paymentMethod,
//       shippingMethod: createOrderDto.shippingMethod,
//       shippingCost: shippingRate,
//       currency: createOrderDto.currency || 'USD',
//       locale: createOrderDto.locale || 'en-US',
//       source: createOrderDto.source || 'web',
//       metadata: createOrderDto.metadata || {},
//       statusHistory: [
//         {
//           status: OrderStatus.PENDING,
//           date: new Date(),
//           notes: "Order created",
//           userId: new Types.ObjectId(userId),
//         },
//       ],
//     })
  
//     const savedOrder = await newOrder.save()
//     console.log(`✅ Order saved with ID: ${savedOrder._id}`)
//     console.log(`✅ Order payment status: ${savedOrder.paymentStatus}`)
//     console.log(`✅ Order paid amount: ${savedOrder.paidAmount}`)
  
//     console.log('=== REDUCING INVENTORY ===')
//     // Reduce inventory for each item using pre-fetched inventory
//     for (let i = 0; i < createOrderDto.items.length; i++) {
//       const item = createOrderDto.items[i]
//       console.log(`Reducing stock for item ${i + 1}: ${item.product}`)
  
//       try {
//         // Use the inventory we already fetched and validated
//         const inventory = inventoryMap.get(item.product)
        
//         if (!inventory) {
//           throw new Error(`Pre-fetched inventory not found for product ${item.product}`)
//         }
  
//         // Update inventory directly
//         inventory.quantity -= item.quantity
  
//         // Add to history
//         inventory.history.push({
//           date: new Date(),
//           action: "REMOVE",
//           quantity: item.quantity,
//           notes: `Order #${orderNumber}`,
//           userId: new Types.ObjectId(userId),
//         })
  
//         await inventory.save()
//         console.log(`✅ Stock reduced for ${item.product}. New quantity: ${inventory.quantity}`)
  
//         // Log audit
//         await this.auditService.createAuditLog({
//           action: "REMOVE",
//           userId,
//           module: "INVENTORY",
//           description: `Inventory reduced for product ${inventory.product}`,
//           changes: JSON.stringify({ quantity: item.quantity, notes: `Order #${orderNumber}` }),
//         })
  
//       } catch (error) {
//         console.error(`❌ Error reducing stock for ${item.product}:`, error.message)
        
//         // If inventory reduction fails, we should consider rolling back the order
//         // For now, we'll just log the error and continue
//         console.error(`WARNING: Order ${orderNumber} was created but inventory reduction failed for product ${item.product}`)
//       }
//     }
  
//     console.log('=== POST-ORDER PROCESSING ===')
//     try {
//       // Create invoice automatically
//       await this.createInvoiceFromOrder(savedOrder, user._id.toString())
  
//       // Send email notification
//       await this.emailService.sendOrderConfirmation(savedOrder, user)
  
//       // Send notification
//       await this.notificationsService.createNotification({
//         user: userId,
//         title: "Order Placed",
//         message: `Your order #${orderNumber} has been placed successfully.`,
//         type: "order",
//         reference: savedOrder._id.toString(),
//       })
  
//       // Send admin notification
//       await this.notificationsService.createAdminNotification({
//         title: "New Order",
//         message: `New order #${orderNumber} has been placed by ${user.firstName} ${user.lastName}.`,
//         type: "order",
//         reference: savedOrder._id.toString(),
//       })
  
//       // Log audit
//       await this.auditService.createAuditLog({
//         action: "CREATE",
//         userId,
//         module: "ORDERS",
//         description: `Order created: #${orderNumber}`,
//       })
  
//       console.log('✅ Order creation completed successfully')
//     } catch (error) {
//       console.error('❌ Error in post-order processing:', error.message)
//       // Order is still created, but some post-processing failed
//     }
  
//     return savedOrder
//   }

//   async createInstallmentOrder(createInstallmentOrderDto: CreateInstallmentOrderDto, userId: string): Promise<Order> {
//     console.log('=== CREATING INSTALLMENT ORDER ===')
    
//     // FIXED: Properly calculate installment details before creating order
//     const total = createInstallmentOrderDto.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
//     const downPayment = createInstallmentOrderDto.downPayment
//     const numberOfInstallments = createInstallmentOrderDto.numberOfInstallments
//     const interestRate = createInstallmentOrderDto.interestRate || 0
    
//     // Validate calculations
//     if (downPayment < 0 || downPayment > total) {
//       throw new BadRequestException('Invalid down payment amount')
//     }
    
//     // Calculate remaining amount and installment details
//     const remainingAmount = total - downPayment
//     let installmentAmount: number
//     let totalPayable: number
    
//     if (interestRate > 0) {
//       const monthlyInterestRate = interestRate / 12 / 100
//       const factor = Math.pow(1 + monthlyInterestRate, numberOfInstallments)
//       installmentAmount = (remainingAmount * monthlyInterestRate * factor) / (factor - 1)
//       totalPayable = downPayment + installmentAmount * numberOfInstallments
//     } else {
//       installmentAmount = remainingAmount / numberOfInstallments
//       totalPayable = total
//     }
    
//     // Convert to regular order DTO with installment info
//     const orderDto: CreateOrderDto = {
//       ...createInstallmentOrderDto,
//       paymentType: PaymentType.INSTALLMENT,
//       installmentInfo: {
//         installmentPlan: createInstallmentOrderDto.installmentPlanId,
//         numberOfInstallments,
//         downPayment,
//         installmentAmount,
//         interestRate,
//         totalPayable,
//         paymentFrequency: createInstallmentOrderDto.paymentFrequency,
//         paymentMethod: createInstallmentOrderDto.paymentMethod,
//       }
//     }
    
//     const order = await this.create(orderDto, userId)
    
//     // Create installment payment schedule
//     if (order.installmentInfo?.isInstallment) {
//       await this.createInstallmentSchedule(order, userId)
//     }
    
//     return order
//   }

//   private async createInstallmentSchedule(order: Order, userId: string): Promise<void> {
//     console.log('=== CREATING INSTALLMENT SCHEDULE ===')
    
//     const installmentInfo = order.installmentInfo
//     if (!installmentInfo || !installmentInfo.isInstallment) {
//       return
//     }
    
//     const scheduleItems = []
//     const startDate = new Date()
    
//     // Create down payment if applicable
//     if (installmentInfo.downPayment > 0) {
//       scheduleItems.push({
//         order: order._id,
//         customer: order.customer,
//         amount: installmentInfo.downPayment,
//         dueDate: startDate,
//         type: 'down_payment',
//         status: 'paid', // FIXED: Mark down payment as paid since it's already processed
//         installmentNumber: 0,
//       })
//     }
    
//     // Create installment payments
//     for (let i = 1; i <= installmentInfo.numberOfInstallments; i++) {
//       const dueDate = new Date(startDate)
      
//       // Calculate due date based on payment frequency
//       switch (installmentInfo.paymentFrequency) {
//         case 'weekly':
//           dueDate.setDate(startDate.getDate() + (i * 7))
//           break
//         case 'bi-weekly':
//           dueDate.setDate(startDate.getDate() + (i * 14))
//           break
//         case 'monthly':
//         default:
//           dueDate.setMonth(startDate.getMonth() + i)
//           break
//       }
      
//       scheduleItems.push({
//         order: order._id,
//         customer: order.customer,
//         amount: installmentInfo.installmentAmount,
//         dueDate,
//         type: 'installment',
//         status: 'pending',
//         installmentNumber: i,
//       })
//     }
    
//     // Create payment schedule records
//     for (const item of scheduleItems) {
//       try {
//         if (this.paymentsService && typeof this.paymentsService.createScheduledPayment === 'function') {
//           await this.paymentsService.createScheduledPayment(item, userId)
//         } else {
//           // Alternative: Create a simple payment record or log
//           console.log('Creating scheduled payment:', item)
          
//           // Log the scheduled payment creation as audit
//           await this.auditService.createAuditLog({
//             action: "CREATE_SCHEDULED_PAYMENT",
//             userId,
//             module: "ORDERS",
//             description: `Scheduled payment created for order ${order.orderNumber}`,
//             changes: JSON.stringify(item),
//           })
//         }
//       } catch (error) {
//         console.error('Error creating scheduled payment:', error)
//         // Continue with other payments even if one fails
//       }
//     }
    
//     console.log(`✅ Created ${scheduleItems.length} scheduled payments`)
//   }

//   async processInstallmentPayment(orderId: string, paymentAmount: number, paymentReference: string, userId: string): Promise<Order> {
//     const order = await this.findOne(orderId)
    
//     if (order.paymentType !== PaymentType.INSTALLMENT) {
//       throw new BadRequestException('Order is not an installment order')
//     }
    
//     // FIXED: Calculate new paid amount and payment status
//     const newPaidAmount = order.paidAmount + paymentAmount
//     let newPaymentStatus: PaymentStatus
    
//     if (newPaidAmount >= order.total) {
//       newPaymentStatus = PaymentStatus.PAID
//     } else if (newPaidAmount > 0) {
//       newPaymentStatus = PaymentStatus.PARTIALLY_PAID
//     } else {
//       newPaymentStatus = PaymentStatus.PENDING
//     }
    
//     // Update paid amount
//     const updatedOrder = await this.orderModel.findByIdAndUpdate(
//       orderId,
//       {
//         $inc: { paidAmount: paymentAmount },
//         $set: { 
//           paymentReference,
//           paymentStatus: newPaymentStatus
//         }
//       },
//       { new: true }
//     )
    
//     // Log payment
//     await this.auditService.createAuditLog({
//       action: "PAYMENT",
//       userId,
//       module: "ORDERS",
//       description: `Installment payment of ${paymentAmount} received for order #${order.orderNumber}`,
//       changes: JSON.stringify({ paymentAmount, paymentReference, newPaidAmount, newPaymentStatus }),
//     })
    
//     // Send notification
//     await this.notificationsService.createNotification({
//       user: order.customer.toString(),
//       title: "Payment Received",
//       message: `Payment of ${paymentAmount} received for order #${order.orderNumber}.`,
//       type: "payment",
//       reference: order._id.toString(),
//     })
    
//     return updatedOrder
//   }

//   private async createInvoiceFromOrder(order: Order, userId: string): Promise<void> {
//     // Map order items to invoice items
//     const invoiceItems = order.items.map((item) => ({
//       description: `Product ID: ${item.product}`,
//       quantity: item.quantity,
//       price: item.price,
//     }))

//     // Add shipping as an invoice item
//     if (order.shipping > 0) {
//       invoiceItems.push({
//         description: "Shipping and Handling",
//         quantity: 1,
//         price: order.shipping,
//       })
//     }

//     // Add tax as an invoice item
//     if (order.tax > 0) {
//       invoiceItems.push({
//         description: `Tax (${order.taxRate}%)`,
//         quantity: 1,
//         price: order.tax,
//       })
//     }

//     // Set due date based on payment type
//     const dueDate = new Date()
//     if (order.paymentType === PaymentType.INSTALLMENT) {
//       // For installment orders, set due date to first installment due date
//       dueDate.setDate(dueDate.getDate() + 7) // 7 days for down payment
//     } else {
//       dueDate.setDate(dueDate.getDate() + 14) // 14 days for full payment
//     }

//     // Create invoice using InvoiceService
//     await this.invoiceService.create(
//       {
//         customer: order.customer.toString(),
//         order: order._id.toString(),
//         items: invoiceItems,
//         dueDate: dueDate.toISOString(),
//         notes: order.paymentType === PaymentType.INSTALLMENT 
//           ? `Invoice for installment order #${order.orderNumber}. Includes VAT at ${order.taxRate}%`
//           : `Invoice for order #${order.orderNumber}. Includes VAT at ${order.taxRate}%`,
//         billingAddress: order.billingAddress,
//       },
//       userId,
//     )
//   }

//   async findAll(params: PaginationParams): Promise<PaginatedResult<Order>> {
//     const { page = 1, limit = 10, sort = "createdAt", order = "desc", search } = params
//     const skip = (page - 1) * limit

//     // Build query
//     let query = {}
//     if (search) {
//       query = {
//         $or: [
//           { orderNumber: { $regex: search, $options: "i" } },
//           { "shippingAddress.firstName": { $regex: search, $options: "i" } },
//           { "shippingAddress.lastName": { $regex: search, $options: "i" } },
//           { "shippingAddress.email": { $regex: search, $options: "i" } },
//         ],
//       }
//     }

//     // Execute query
//     const [orders, total] = await Promise.all([
//       this.orderModel
//         .find(query)
//         .sort({ [sort]: order === "asc" ? 1 : -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("customer", "firstName lastName email")
//         .populate("items.product", "name images")
//         .populate("installmentInfo.installmentPlan", "name description")
//         .exec(),
//       this.orderModel.countDocuments(query).exec(),
//     ])

//     return {
//       data: orders,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     }
//   }

//   async findByUser(userId: string, params: PaginationParams): Promise<PaginatedResult<Order>> {
//     const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
//     const skip = (page - 1) * limit

//     const [orders, total] = await Promise.all([
//       this.orderModel
//         .find({ customer: userId })
//         .sort({ [sort]: order === "asc" ? 1 : -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("items.product", "name images")
//         .populate("installmentInfo.installmentPlan", "name description")
//         .exec(),
//       this.orderModel.countDocuments({ customer: userId }).exec(),
//     ])

//     return {
//       data: orders,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     }
//   }

//   async findInstallmentOrders(params: PaginationParams): Promise<PaginatedResult<Order>> {
//     const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
//     const skip = (page - 1) * limit

//     const [orders, total] = await Promise.all([
//       this.orderModel
//         .find({ paymentType: PaymentType.INSTALLMENT })
//         .sort({ [sort]: order === "asc" ? 1 : -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("customer", "firstName lastName email")
//         .populate("items.product", "name images")
//         .populate("installmentInfo.installmentPlan", "name description")
//         .exec(),
//       this.orderModel.countDocuments({ paymentType: PaymentType.INSTALLMENT }).exec(),
//     ])

//     return {
//       data: orders,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     }
//   }

//   async findOne(id: string): Promise<Order> {
//     const order = await this.orderModel
//       .findById(id)
//       .populate("customer", "_id firstName lastName email") 
//       .populate("items.product", "name images price discountPrice")
//       .populate("transaction")
//       .populate("installmentInfo.installmentPlan", "name description")
//       .exec()

//     if (!order) {
//       throw new NotFoundException(`Order with ID ${id} not found`)
//     }

//     return order
//   }

//   async findByOrderNumber(orderNumber: string): Promise<Order> {
//     const order = await this.orderModel
//       .findOne({ orderNumber })
//       .populate("customer", "firstName lastName email phone")
//       .populate("items.product", "name images price discountPrice")
//       .populate("transaction")
//       .populate("installmentInfo.installmentPlan", "name description")
//       .exec()

//     if (!order) {
//       throw new NotFoundException(`Order #${orderNumber} not found`)
//     }

//     return order
//   }

//   async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, userId: string): Promise<Order> {
//     const order = (await this.findOne(id)) as any
//     const oldStatus = order.status
//     const newStatus = updateOrderStatusDto.status

//     // Validate status transition
//     this.validateStatusTransition(oldStatus, newStatus)

//     // Use schema method to update status
//     order.addStatusHistory(newStatus, updateOrderStatusDto.notes, userId)

//     // Update tracking information if provided
//     if (updateOrderStatusDto.trackingNumber) {
//       order.trackingNumber = updateOrderStatusDto.trackingNumber
//     }

//     if (updateOrderStatusDto.trackingUrl) {
//       order.trackingUrl = updateOrderStatusDto.trackingUrl
//     }

//     if (updateOrderStatusDto.estimatedDelivery) {
//       order.estimatedDelivery = new Date(updateOrderStatusDto.estimatedDelivery)
//     }

//     // Handle status-specific logic
//     if (newStatus === OrderStatus.DELIVERED && !order.deliveredAt) {
//       // Create a sale record when order is delivered
//       try {
//         const productIds = order.items.map((item) => item.product)

//         await this.salesService.create(
//           {
//             order: order._id,
//             customer: order.customer._id,
//             products: productIds,
//             amount: order.total,
//             date: new Date().toISOString(),
//             transaction: order.transaction,
//             notes: `Sale created from order #${order.orderNumber} when marked as delivered`,
//           },
//           userId,
//         )

//         console.log(`Sale record created for order #${order.orderNumber}`)
//       } catch (error) {
//         console.error(`Failed to create sale record for order #${order.orderNumber}:`, error)
//       }
//     } else if (newStatus === OrderStatus.CANCELLED) {
//       // Restore inventory
//       for (const item of order.items) {
//         await this.inventoryService.restoreStock(
//           item.product.toString(),
//           item.quantity,
//           userId,
//           `Order #${order.orderNumber} cancelled`,
//         )
//       }
//     } else if (newStatus === OrderStatus.RETURNED) {
//       // Restore inventory
//       for (const item of order.items) {
//         await this.inventoryService.restoreStock(
//           item.product.toString(),
//           item.quantity,
//           userId,
//           `Order #${order.orderNumber} returned`,
//         )
//       }
//     } else if (newStatus === OrderStatus.REFUNDED) {
//       order.paymentStatus = PaymentStatus.REFUNDED
//     }

//     const updatedOrder = await order.save()

//     // Extract customer ID and send notification
//     const customerId = this.extractCustomerId(order.customer)
//     if (customerId) {
//       try {
//         const customer = await this.usersService.findById(customerId)

//         await this.notificationsService.createNotification({
//           user: customer._id.toString(),
//           title: "Order Status Updated",
//           message: `Your order #${order.orderNumber} status has been updated to ${newStatus}.`,
//           type: "order",
//           reference: order._id.toString(),
//         })
//       } catch (error) {
//         console.error("Error sending notification:", error)
//       }
//     }

//     // Log audit
//     await this.auditService.createAuditLog({
//       action: "UPDATE",
//       userId,
//       module: "ORDERS",
//       description: `Order #${order.orderNumber} status updated from ${oldStatus} to ${newStatus}`,
//       changes: JSON.stringify(updateOrderStatusDto),
//     })

//     return updatedOrder
//   }

//   async updatePaymentStatus(id: string, updatePaymentStatusDto: UpdatePaymentStatusDto, userId: string): Promise<Order> {
//     const order = (await this.findOne(id)) as any
//     const oldPaymentStatus = order.paymentStatus

//     // Use schema method to update payment status
//     order.updatePaymentStatus(
//       updatePaymentStatusDto.paymentStatus,
//       updatePaymentStatusDto.amount,
//       updatePaymentStatusDto.paymentReference
//     )

//     // Update transaction if provided
//     if (updatePaymentStatusDto.transactionId) {
//       order.transaction = new Types.ObjectId(updatePaymentStatusDto.transactionId)
//     }

//     // Update payment method if provided
//     if (updatePaymentStatusDto.paymentMethod) {
//       order.paymentMethod = updatePaymentStatusDto.paymentMethod
//     }

//     // Update payment details if provided
//     if (updatePaymentStatusDto.paymentDetails) {
//       order.paymentDetails = updatePaymentStatusDto.paymentDetails
//     }

//     // Convert DTO enum to schema enum for comparison
//     const dtoPaymentStatus = updatePaymentStatusDto.paymentStatus
    
//     // If payment is successful and order is pending, move to processing
//     if (dtoPaymentStatus === PaymentStatusEnum.PAID && order.status === OrderStatus.PENDING) {
//       order.addStatusHistory(OrderStatus.PROCESSING, "Payment received, order processing", userId)
//     }

//     const updatedOrder = await order.save()

//     // Send notification to customer
//     const customerId = this.extractCustomerId(order.customer)
//     if (customerId) {
//       try {
//         const customer = await this.usersService.findById(customerId)

//         await this.notificationsService.createNotification({
//           user: customer._id.toString(),
//           title: "Payment Status Updated",
//           message: `Payment for your order #${order.orderNumber} has been ${updatePaymentStatusDto.paymentStatus}.`,
//           type: "payment",
//           reference: order._id.toString(),
//         })
//       } catch (error) {
//         console.error("Error sending notification:", error)
//       }
//     }

//     // Log audit
//     await this.auditService.createAuditLog({
//       action: "UPDATE",
//       userId,
//       module: "ORDERS",
//       description: `Order #${order.orderNumber} payment status updated from ${oldPaymentStatus} to ${updatePaymentStatusDto.paymentStatus}`,
//       changes: JSON.stringify(updatePaymentStatusDto),
//     })

//     return updatedOrder
//   }

//   private extractCustomerId(customer: any): string | null {
//     if (!customer) return null

//     if (typeof customer === "string") {
//       return customer
//     }

//     if (typeof customer === "object") {
//       if (customer._id) {
//         return customer._id.toString()
//       }
      
//       if (customer instanceof Types.ObjectId) {
//         return customer.toString()
//       }
      
//       // Handle string representation of ObjectId
//       const customerStr = customer.toString()
//       const match = customerStr.match(/ObjectId\$\$'([0-9a-fA-F]{24})'\$\$/)
//       if (match && match[1]) {
//         return match[1]
//       }
//     }

//     return null
//   }

//   private generateOrderNumber(): string {
//     const prefix = "ORD"
//     const timestamp = Date.now().toString().slice(-8)
//     const random = Math.floor(Math.random() * 1000)
//       .toString()
//       .padStart(3, "0")
//     return `${prefix}-${timestamp}-${random}`
//   }

//   private validateStatusTransition(oldStatus: OrderStatus, newStatus: OrderStatus): void {
//     // Define valid transitions - updated to include CONFIRMED status
//     const validTransitions = {
//       [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.CANCELLED],
//       [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
//       [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
//       [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
//       [OrderStatus.DELIVERED]: [OrderStatus.RETURNED, OrderStatus.REFUNDED],
//       [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
//       [OrderStatus.CANCELLED]: [],
//       [OrderStatus.REFUNDED]: [],
//     }

//     // Check if transition is valid
//     if (!validTransitions[oldStatus].includes(newStatus) && oldStatus !== newStatus) {
//       throw new BadRequestException(`Invalid status transition from ${oldStatus} to ${newStatus}`)
//     }
//   }

//   async getOrderStatistics(): Promise<any> {
//     const today = new Date()
//     const startOfDay = new Date(today.setHours(0, 0, 0, 0))
//     const startOfWeek = new Date(today)
//     startOfWeek.setDate(today.getDate() - today.getDay())
//     startOfWeek.setHours(0, 0, 0, 0)
//     const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

//     const [
//       totalOrders,
//       pendingOrders,
//       confirmedOrders,
//       processingOrders,
//       shippedOrders,
//       deliveredOrders,
//       cancelledOrders,
//       installmentOrders,
//       todayOrders,
//       weekOrders,
//       monthOrders,
//       totalRevenue,
//       todayRevenue,
//       weekRevenue,
//       monthRevenue,
//       installmentRevenue,
//     ] = await Promise.all([
//       this.orderModel.countDocuments().exec(),
//       this.orderModel.countDocuments({ status: OrderStatus.PENDING }).exec(),
//       this.orderModel.countDocuments({ status: OrderStatus.CONFIRMED }).exec(),
//       this.orderModel.countDocuments({ status: OrderStatus.PROCESSING }).exec(),
//       this.orderModel.countDocuments({ status: OrderStatus.SHIPPED }).exec(),
//       this.orderModel.countDocuments({ status: OrderStatus.DELIVERED }).exec(),
//       this.orderModel.countDocuments({ status: OrderStatus.CANCELLED }).exec(),
//       this.orderModel.countDocuments({ paymentType: PaymentType.INSTALLMENT }).exec(),
//       this.orderModel.countDocuments({ createdAt: { $gte: startOfDay } }).exec(),
//       this.orderModel.countDocuments({ createdAt: { $gte: startOfWeek } }).exec(),
//       this.orderModel.countDocuments({ createdAt: { $gte: startOfMonth } }).exec(),
//       this.orderModel
//         .aggregate([
//           { $match: { paymentStatus: { $in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_PAID] } } },
//           { $group: { _id: null, total: { $sum: "$paidAmount" } } },
//         ])
//         .exec(),
//       this.orderModel
//         .aggregate([
//           { $match: { 
//             paymentStatus: { $in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_PAID] }, 
//             createdAt: { $gte: startOfDay } 
//           }},
//           { $group: { _id: null, total: { $sum: "$paidAmount" } } },
//         ])
//         .exec(),
//       this.orderModel
//         .aggregate([
//           { $match: { 
//             paymentStatus: { $in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_PAID] }, 
//             createdAt: { $gte: startOfWeek } 
//           }},
//           { $group: { _id: null, total: { $sum: "$paidAmount" } } },
//         ])
//         .exec(),
//       this.orderModel
//         .aggregate([
//           { $match: { 
//             paymentStatus: { $in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_PAID] }, 
//             createdAt: { $gte: startOfMonth } 
//           }},
//           { $group: { _id: null, total: { $sum: "$paidAmount" } } },
//         ])
//         .exec(),
//       this.orderModel
//         .aggregate([
//           { $match: { 
//             paymentType: PaymentType.INSTALLMENT,
//             paymentStatus: { $in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_PAID] }
//           }},
//           { $group: { _id: null, total: { $sum: "$paidAmount" } } },
//         ])
//         .exec(),
//     ])

//     return {
//       orders: {
//         total: totalOrders,
//         pending: pendingOrders,
//         confirmed: confirmedOrders,
//         processing: processingOrders,
//         shipped: shippedOrders,
//         delivered: deliveredOrders,
//         cancelled: cancelledOrders,
//         installment: installmentOrders,
//         today: todayOrders,
//         week: weekOrders,
//         month: monthOrders,
//       },
//       revenue: {
//         total: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
//         today: todayRevenue.length > 0 ? todayRevenue[0].total : 0,
//         week: weekRevenue.length > 0 ? weekRevenue[0].total : 0,
//         month: monthRevenue.length > 0 ? monthRevenue[0].total : 0,
//         installment: installmentRevenue.length > 0 ? installmentRevenue[0].total : 0,
//       },
//     }
//   }

//   async getRecentOrders(limit = 10): Promise<Order[]> {
//     return this.orderModel
//       .find()
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .populate("customer", "firstName lastName email")
//       .populate("installmentInfo.installmentPlan", "name")
//       .exec()
//   }

//   async getInstallmentOrdersOverdue(): Promise<Order[]> {
//     // This would need to be implemented based on your payment schedule logic
//     // For now, returning empty array
//     return []
//   }

//   async calculateInstallmentDetails(
//     total: number,
//     numberOfInstallments: number,
//     downPaymentPercentage: number,
//     interestRate: number
//   ): Promise<any> {
//     const downPayment = (total * downPaymentPercentage) / 100
//     const remainingAmount = total - downPayment
//     const monthlyInterestRate = interestRate / 12 / 100
    
//     let installmentAmount: number
//     let totalInterest: number
    
//     if (monthlyInterestRate > 0) {
//       // Calculate using compound interest formula
//       const factor = Math.pow(1 + monthlyInterestRate, numberOfInstallments)
//       installmentAmount = (remainingAmount * monthlyInterestRate * factor) / (factor - 1)
//       totalInterest = installmentAmount * numberOfInstallments - remainingAmount
//     } else {
//       // No interest
//       installmentAmount = remainingAmount / numberOfInstallments
//       totalInterest = 0
//     }
    
//     const totalPayable = downPayment + installmentAmount * numberOfInstallments
    
//     return {
//       downPayment,
//       installmentAmount,
//       totalInterest,
//       totalPayable,
//       remainingAmount,
//       monthlyPayment: installmentAmount
//     }
//   }
// }


import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from "@nestjs/common"
import { Model } from "mongoose"
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderStatus, PaymentStatus, PaymentType } from "./schemas/order.schema"
import { CreateOrderDto } from "./dto/create-order.dto"
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto"
import { UpdatePaymentStatusDto } from "./dto/update-payment-status.dto"
import { CreateInstallmentOrderDto } from "./dto/create-installment-order.dto"
import { ProductsService } from "../products/products.service"
import { InventoryService } from "../inventory/inventory.service"
import { UsersService } from "../users/users.service"
import { EmailService } from "../email/email.service"
import { AuditService } from "../audit/audit.service"
import { NotificationsService } from "../notifications/notifications.service"
import { InvoicesService } from "../invoices/invoices.service"
import { ShippingTaxService } from "../shipping-tax/shipping-tax.service"
import { InstallmentsService } from "../installments/installments.service"
import { PaymentsService } from "../payments/payments.service"
import { PaginationParams, PaginatedResult } from "../common/interfaces/pagination.interface"
import { Types } from "mongoose"
import { SalesService } from "src/sales/sales.service"

// Import the PaymentStatus from the enum file for DTO comparison
import { PaymentStatus as PaymentStatusEnum } from "./enums/payment-status.enum"

@Injectable()
export class OrdersService {
  private inventoryService: InventoryService
  private productsService: ProductsService
  private invoiceService: InvoicesService
  private usersService: UsersService
  private emailService: EmailService
  private auditService: AuditService
  private notificationsService: NotificationsService
  private shippingTaxService: ShippingTaxService
  private installmentsService: InstallmentsService
  private paymentsService: PaymentsService
  private salesService: SalesService

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    productsService: ProductsService,
    inventoryService: InventoryService,
    invoiceService: InvoicesService,
    usersService: UsersService,
    emailService: EmailService,
    auditService: AuditService,
    notificationsService: NotificationsService,
    shippingTaxService: ShippingTaxService,
    installmentsService: InstallmentsService,
    @Inject(forwardRef(() => PaymentsService))
    paymentsService: PaymentsService,
    salesService: SalesService,
  ) {
    this.orderModel = orderModel
    this.productsService = productsService
    this.inventoryService = inventoryService
    this.invoiceService = invoiceService
    this.usersService = usersService
    this.emailService = emailService
    this.auditService = auditService
    this.notificationsService = notificationsService
    this.shippingTaxService = shippingTaxService
    this.installmentsService = installmentsService
    this.paymentsService = paymentsService
    this.salesService = salesService
  }

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    console.log('=== STARTING ORDER CREATION ===')
    console.log('User ID:', userId)
    console.log('Order items:', createOrderDto.items)
    console.log('Payment type:', createOrderDto.paymentType || PaymentType.FULL)
  
    // Validate user
    const user = await this.usersService.findById(userId)
  
    // Generate order number
    const orderNumber = this.generateOrderNumber()
  
    // Process order items - Pre-validate everything first
    const orderItems = []
    const inventoryMap = new Map<string, any>()
    let subtotal = 0
  
    console.log('=== PRE-VALIDATION PHASE ===')
    for (let i = 0; i < createOrderDto.items.length; i++) {
      const item = createOrderDto.items[i]
      console.log(`\n--- Processing Item ${i + 1}: ${item.product} ---`)
  
      try {
        // Get product details
        console.log('1. Fetching product details...')
        const product = await this.productsService.findProductById(item.product)
        console.log(`✅ Found product: ${product.name}`)
  
        // Check if product is available
        if (!product.isAvailable) {
          throw new BadRequestException(`Product ${product.name} is not available`)
        }
  
        // Get inventory for this product with retry logic
        console.log('2. Fetching inventory...')
        let inventory = null
        let retryCount = 0
        const maxRetries = 3
  
        while (!inventory && retryCount < maxRetries) {
          try {
            inventory = await this.inventoryService.findByProduct(item.product)
            console.log(`✅ Found inventory on attempt ${retryCount + 1}`)
            break
          } catch (error) {
            retryCount++
            console.log(`❌ Inventory fetch attempt ${retryCount} failed: ${error.message}`)
            
            if (retryCount < maxRetries) {
              console.log(`Retrying in 1 second...`)
              await new Promise(resolve => setTimeout(resolve, 1000))
            } else {
              console.log(`All ${maxRetries} attempts failed`)
              throw error
            }
          }
        }
  
        // Store inventory for later use
        inventoryMap.set(item.product, inventory)
  
        // Check if we have enough stock
        if (inventory.quantity < item.quantity) {
          throw new BadRequestException(
            `Not enough stock for ${product.name}. Available: ${inventory.quantity}, Requested: ${item.quantity}`,
          )
        }
  
        // Check if product is out of stock
        if (inventory.isOutOfStock) {
          throw new BadRequestException(`Product ${product.name} is out of stock`)
        }
  
        // Calculate item total - use price from DTO if provided, otherwise from product
        const basePrice = item.price || (product.discountPrice > 0 ? product.discountPrice : product.price)
        const itemDiscount = item.discount || 0
        const discountedPrice = basePrice - (basePrice * itemDiscount / 100)
        const total = discountedPrice * item.quantity
  
        // Add to order items
        orderItems.push({
          product: item.product,
          quantity: item.quantity,
          price: discountedPrice,
          size: item.size,
          color: item.color,
          discount: itemDiscount,
          total,
        })
  
        // Add to subtotal
        subtotal += total
  
        console.log(`✅ Item ${i + 1} validated successfully`)
      } catch (error) {
        console.error(`❌ Error processing item ${i + 1}:`, error.message)
        throw error
      }
    }
  
    console.log('=== ALL ITEMS PRE-VALIDATED SUCCESSFULLY ===')
  
    // Use provided values or calculate them
    const finalSubtotal = createOrderDto.subtotal || subtotal
    const countryCode = createOrderDto.shippingAddress.country || "DEFAULT"
    
    // Get shipping and tax rates
    const shippingRate = createOrderDto.shipping || await this.shippingTaxService.getShippingRate(countryCode)
    const vatRate = createOrderDto.taxRate || await this.shippingTaxService.getVatRate(countryCode)
    
    // Calculate VAT amount
    const vatAmount = createOrderDto.tax || (finalSubtotal * (vatRate / 100))
    
    // Apply order-level discount if provided
    const orderDiscount = createOrderDto.discount || 0
    const discountAmount = finalSubtotal * (orderDiscount / 100)
    const discountedSubtotal = finalSubtotal - discountAmount
    
    // Calculate total
    const total = createOrderDto.total || (discountedSubtotal + shippingRate + vatAmount)
  
    // FIXED: Initialize payment status and paid amount based on payment type
    let initialPaymentStatus = PaymentStatus.PENDING
    let initialPaidAmount = createOrderDto.paidAmount || 0
    let installmentInfo = null
  
    // Handle installment information if payment type is installment
    if (createOrderDto.paymentType === PaymentType.INSTALLMENT && createOrderDto.installmentInfo) {
      console.log('=== PROCESSING INSTALLMENT ORDER ===')
      
      // Validate installment plan if provided
      if (createOrderDto.installmentInfo.installmentPlan) {
        try {
          // Check if the service has the method we need
          if (this.installmentsService && typeof this.installmentsService.getInstallmentPlan === 'function') {
            const installmentPlan = await this.installmentsService.getInstallmentPlan(
              createOrderDto.installmentInfo.installmentPlan.toString(),
              userId
            )
            
            if (installmentPlan && typeof installmentPlan === 'object' && installmentPlan !== null) {
              if ('status' in installmentPlan && installmentPlan.status !== 'active') {
                throw new BadRequestException('Selected installment plan is not active')
              }
              console.log('✅ Installment plan validated')
            }
          } else {
            console.warn('InstallmentsService.getInstallmentPlan method not available, skipping validation')
          }
        } catch (error) {
          console.error('Error validating installment plan:', error.message)
          if (error instanceof BadRequestException) {
            throw error
          }
          // For other errors, just log and continue
          console.warn('Installment plan validation failed, continuing with order creation')
        }
      }
      
      // FIXED: Calculate installment details properly
      const downPayment = createOrderDto.installmentInfo.downPayment
      const numberOfInstallments = createOrderDto.installmentInfo.numberOfInstallments
      const interestRate = createOrderDto.installmentInfo.interestRate || 0
      
      // Validate down payment amount
      if (downPayment < 0 || downPayment > total) {
        throw new BadRequestException('Invalid down payment amount')
      }
      
      // Calculate remaining amount after down payment
      const remainingAmount = total - downPayment
      
      // Calculate installment amount with interest
      let installmentAmount: number
      let totalInterest: number
      let totalPayable: number
      
      if (interestRate > 0) {
        const monthlyInterestRate = interestRate / 12 / 100
        const factor = Math.pow(1 + monthlyInterestRate, numberOfInstallments)
        installmentAmount = (remainingAmount * monthlyInterestRate * factor) / (factor - 1)
        totalInterest = installmentAmount * numberOfInstallments - remainingAmount
        totalPayable = downPayment + installmentAmount * numberOfInstallments
      } else {
        installmentAmount = remainingAmount / numberOfInstallments
        totalInterest = 0
        totalPayable = total // No interest, so total payable equals original total
      }
      
      installmentInfo = {
        isInstallment: true,
        installmentPlan: createOrderDto.installmentInfo.installmentPlan,
        numberOfInstallments,
        downPayment,
        installmentAmount,
        interestRate,
        totalPayable,
        totalInterest,
        remainingAmount: installmentAmount * numberOfInstallments, // Amount still to be paid in installments
        paymentFrequency: createOrderDto.installmentInfo.paymentFrequency || 'monthly',
        paymentMethod: createOrderDto.installmentInfo.paymentMethod,
      }
      
      // FIXED: For installment orders, if down payment > 0, set as partially paid
      if (downPayment > 0) {
        initialPaymentStatus = PaymentStatus.PARTIALLY_PAID
        initialPaidAmount = downPayment
      }
      
      console.log('✅ Installment info processed:', {
        downPayment,
        installmentAmount,
        totalPayable,
        remainingAmount: installmentAmount * numberOfInstallments
      })
    }
  
    console.log('=== CREATING ORDER DOCUMENT ===')
    // Create order
    const newOrder = new this.orderModel({
      orderNumber,
      customer: userId,
      items: orderItems,
      subtotal: discountedSubtotal,
      tax: vatAmount,
      taxRate: vatRate,
      shipping: shippingRate,
      discount: orderDiscount,
      total,
      status: OrderStatus.PENDING,
      paymentStatus: initialPaymentStatus, // FIXED: Use calculated payment status
      paymentType: createOrderDto.paymentType || PaymentType.FULL,
      installmentInfo,
      shippingAddress: createOrderDto.shippingAddress,
      billingAddress: createOrderDto.billingAddress,
      notes: createOrderDto.notes,
      paidAmount: initialPaidAmount, // FIXED: Use calculated paid amount
      refundedAmount: 0,
      paymentMethod: createOrderDto.paymentMethod,
      shippingMethod: createOrderDto.shippingMethod,
      shippingCost: shippingRate,
      currency: createOrderDto.currency || 'USD',
      locale: createOrderDto.locale || 'en-US',
      source: createOrderDto.source || 'web',
      metadata: createOrderDto.metadata || {},
      estimatedDelivery: createOrderDto.estimatedDelivery ? new Date(createOrderDto.estimatedDelivery) : undefined,
      statusHistory: [
        {
          status: OrderStatus.PENDING,
          date: new Date(),
          notes: "Order created",
          userId: new Types.ObjectId(userId),
        },
      ],
    })
  
    const savedOrder = await newOrder.save()
    console.log(`✅ Order saved with ID: ${savedOrder._id}`)
    console.log(`✅ Order payment status: ${savedOrder.paymentStatus}`)
    console.log(`✅ Order paid amount: ${savedOrder.paidAmount}`)
  
    console.log('=== REDUCING INVENTORY ===')
    // Reduce inventory for each item using pre-fetched inventory
    for (let i = 0; i < createOrderDto.items.length; i++) {
      const item = createOrderDto.items[i]
      console.log(`Reducing stock for item ${i + 1}: ${item.product}`)
  
      try {
        // Use the inventory we already fetched and validated
        const inventory = inventoryMap.get(item.product)
        
        if (!inventory) {
          throw new Error(`Pre-fetched inventory not found for product ${item.product}`)
        }
  
        // Update inventory directly
        inventory.quantity -= item.quantity
  
        // Add to history
        inventory.history.push({
          date: new Date(),
          action: "REMOVE",
          quantity: item.quantity,
          notes: `Order #${orderNumber}`,
          userId: new Types.ObjectId(userId),
        })
  
        await inventory.save()
        console.log(`✅ Stock reduced for ${item.product}. New quantity: ${inventory.quantity}`)
  
        // Log audit
        await this.auditService.createAuditLog({
          action: "REMOVE",
          userId,
          module: "INVENTORY",
          description: `Inventory reduced for product ${inventory.product}`,
          changes: JSON.stringify({ quantity: item.quantity, notes: `Order #${orderNumber}` }),
        })
  
      } catch (error) {
        console.error(`❌ Error reducing stock for ${item.product}:`, error.message)
        
        // If inventory reduction fails, we should consider rolling back the order
        // For now, we'll just log the error and continue
        console.error(`WARNING: Order ${orderNumber} was created but inventory reduction failed for product ${item.product}`)
      }
    }
  
    console.log('=== POST-ORDER PROCESSING ===')
    try {
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
  
      console.log('✅ Order creation completed successfully')
    } catch (error) {
      console.error('❌ Error in post-order processing:', error.message)
      // Order is still created, but some post-processing failed
    }
  
    return savedOrder
  }

  async createInstallmentOrder(createInstallmentOrderDto: CreateInstallmentOrderDto, userId: string): Promise<Order> {
    console.log('=== CREATING INSTALLMENT ORDER ===')
    
    // FIXED: Calculate total from products instead of using DTO price
    let calculatedTotal = 0
    
    // Fetch product details and calculate total
    for (const item of createInstallmentOrderDto.items) {
      try {
        const product = await this.productsService.findProductById(item.product)
        const basePrice = item.price || (product.discountPrice > 0 ? product.discountPrice : product.price)
        const itemDiscount = item.discount || 0
        const discountedPrice = basePrice - (basePrice * itemDiscount / 100)
        calculatedTotal += discountedPrice * item.quantity
      } catch (error) {
        console.error(`Error fetching product ${item.product}:`, error.message)
        throw new BadRequestException(`Product ${item.product} not found`)
      }
    }
    
    // Use provided total or calculated total
    const total = createInstallmentOrderDto.total || calculatedTotal
    const downPayment = createInstallmentOrderDto.downPayment
    const numberOfInstallments = createInstallmentOrderDto.numberOfInstallments
    const interestRate = createInstallmentOrderDto.interestRate || 0
    
    // Validate calculations
    if (downPayment < 0 || downPayment > total) {
      throw new BadRequestException('Invalid down payment amount')
    }
    
    // Calculate remaining amount and installment details
    const remainingAmount = total - downPayment
    let installmentAmount: number
    let totalPayable: number
    
    if (interestRate > 0) {
      const monthlyInterestRate = interestRate / 12 / 100
      const factor = Math.pow(1 + monthlyInterestRate, numberOfInstallments)
      installmentAmount = (remainingAmount * monthlyInterestRate * factor) / (factor - 1)
      totalPayable = downPayment + installmentAmount * numberOfInstallments
    } else {
      installmentAmount = remainingAmount / numberOfInstallments
      totalPayable = total
    }
    
    // Convert to regular order DTO with installment info
    const orderDto: CreateOrderDto = {
      ...createInstallmentOrderDto,
      paymentType: PaymentType.INSTALLMENT,
      total: total,
      subtotal: createInstallmentOrderDto.subtotal,
      tax: createInstallmentOrderDto.tax,
      taxRate: createInstallmentOrderDto.taxRate,
      shipping: createInstallmentOrderDto.shipping,
      paidAmount: downPayment, // Set the paid amount to down payment
      installmentInfo: {
        installmentPlan: createInstallmentOrderDto.installmentPlanId,
        numberOfInstallments,
        downPayment,
        installmentAmount,
        interestRate,
        totalPayable,
        paymentFrequency: createInstallmentOrderDto.paymentFrequency,
        paymentMethod: createInstallmentOrderDto.paymentMethod,
      }
    }
    
    const order = await this.create(orderDto, userId)
    
    // Create installment payment schedule
    if (order.installmentInfo?.isInstallment) {
      await this.createInstallmentSchedule(order, userId)
    }
    
    return order
  }

  private async createInstallmentSchedule(order: Order, userId: string): Promise<void> {
    console.log('=== CREATING INSTALLMENT SCHEDULE ===')
    
    const installmentInfo = order.installmentInfo
    if (!installmentInfo || !installmentInfo.isInstallment) {
      return
    }
    
    const scheduleItems = []
    const startDate = new Date()
    
    // Create down payment if applicable
    if (installmentInfo.downPayment > 0) {
      scheduleItems.push({
        order: order._id,
        customer: order.customer,
        amount: installmentInfo.downPayment,
        dueDate: startDate,
        type: 'down_payment',
        status: 'paid', // FIXED: Mark down payment as paid since it's already processed
        installmentNumber: 0,
      })
    }
    
    // Create installment payments
    for (let i = 1; i <= installmentInfo.numberOfInstallments; i++) {
      const dueDate = new Date(startDate)
      
      // Calculate due date based on payment frequency
      switch (installmentInfo.paymentFrequency) {
        case 'weekly':
          dueDate.setDate(startDate.getDate() + (i * 7))
          break
        case 'bi-weekly':
          dueDate.setDate(startDate.getDate() + (i * 14))
          break
        case 'monthly':
        default:
          dueDate.setMonth(startDate.getMonth() + i)
          break
      }
      
      scheduleItems.push({
        order: order._id,
        customer: order.customer,
        amount: installmentInfo.installmentAmount,
        dueDate,
        type: 'installment',
        status: 'pending',
        installmentNumber: i,
      })
    }
    
    // Create payment schedule records
    for (const item of scheduleItems) {
      try {
        if (this.paymentsService && typeof this.paymentsService.createScheduledPayment === 'function') {
          await this.paymentsService.createScheduledPayment(item, userId)
        } else {
          // Alternative: Create a simple payment record or log
          console.log('Creating scheduled payment:', item)
          
          // Log the scheduled payment creation as audit
          await this.auditService.createAuditLog({
            action: "CREATE_SCHEDULED_PAYMENT",
            userId,
            module: "ORDERS",
            description: `Scheduled payment created for order ${order.orderNumber}`,
            changes: JSON.stringify(item),
          })
        }
      } catch (error) {
        console.error('Error creating scheduled payment:', error)
        // Continue with other payments even if one fails
      }
    }
    
    console.log(`✅ Created ${scheduleItems.length} scheduled payments`)
  }

  async processInstallmentPayment(orderId: string, paymentAmount: number, paymentReference: string, userId: string): Promise<Order> {
    const order = await this.findOne(orderId)
    
    if (order.paymentType !== PaymentType.INSTALLMENT) {
      throw new BadRequestException('Order is not an installment order')
    }
    
    // FIXED: Calculate new paid amount and payment status
    const newPaidAmount = order.paidAmount + paymentAmount
    let newPaymentStatus: PaymentStatus
    
    if (newPaidAmount >= order.total) {
      newPaymentStatus = PaymentStatus.PAID
    } else if (newPaidAmount > 0) {
      newPaymentStatus = PaymentStatus.PARTIALLY_PAID
    } else {
      newPaymentStatus = PaymentStatus.PENDING
    }
    
    // Update paid amount
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      orderId,
      {
        $inc: { paidAmount: paymentAmount },
        $set: { 
          paymentReference,
          paymentStatus: newPaymentStatus
        }
      },
      { new: true }
    )
    
    // Log payment
    await this.auditService.createAuditLog({
      action: "PAYMENT",
      userId,
      module: "ORDERS",
      description: `Installment payment of ${paymentAmount} received for order #${order.orderNumber}`,
      changes: JSON.stringify({ paymentAmount, paymentReference, newPaidAmount, newPaymentStatus }),
    })
    
    // Send notification
    await this.notificationsService.createNotification({
      user: order.customer.toString(),
      title: "Payment Received",
      message: `Payment of ${paymentAmount} received for order #${order.orderNumber}.`,
      type: "payment",
      reference: order._id.toString(),
    })
    
    return updatedOrder
  }

  private async createInvoiceFromOrder(order: Order, userId: string): Promise<void> {
    // Map order items to invoice items
    const invoiceItems = order.items.map((item) => ({
      description: `Product ID: ${item.product}`,
      quantity: item.quantity,
      price: item.price,
    }))

    // Add shipping as an invoice item
    if (order.shipping > 0) {
      invoiceItems.push({
        description: "Shipping and Handling",
        quantity: 1,
        price: order.shipping,
      })
    }

    // Add tax as an invoice item
    if (order.tax > 0) {
      invoiceItems.push({
        description: `Tax (${order.taxRate}%)`,
        quantity: 1,
        price: order.tax,
      })
    }

    // Set due date based on payment type
    const dueDate = new Date()
    if (order.paymentType === PaymentType.INSTALLMENT) {
      // For installment orders, set due date to first installment due date
      dueDate.setDate(dueDate.getDate() + 7) // 7 days for down payment
    } else {
      dueDate.setDate(dueDate.getDate() + 14) // 14 days for full payment
    }

    // Create invoice using InvoiceService
    await this.invoiceService.create(
      {
        customer: order.customer.toString(),
        order: order._id.toString(),
        items: invoiceItems,
        dueDate: dueDate.toISOString(),
        notes: order.paymentType === PaymentType.INSTALLMENT 
          ? `Invoice for installment order #${order.orderNumber}. Includes VAT at ${order.taxRate}%`
          : `Invoice for order #${order.orderNumber}. Includes VAT at ${order.taxRate}%`,
        billingAddress: order.billingAddress,
      },
      userId,
    )
  }

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
        .populate("installmentInfo.installmentPlan", "name description")
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
        .populate("installmentInfo.installmentPlan", "name description")
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

  async findInstallmentOrders(params: PaginationParams): Promise<PaginatedResult<Order>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      this.orderModel
        .find({ paymentType: PaymentType.INSTALLMENT })
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("customer", "firstName lastName email")
        .populate("items.product", "name images")
        .populate("installmentInfo.installmentPlan", "name description")
        .exec(),
      this.orderModel.countDocuments({ paymentType: PaymentType.INSTALLMENT }).exec(),
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

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate("customer", "_id firstName lastName email") 
      .populate("items.product", "name images price discountPrice")
      .populate("transaction")
      .populate("installmentInfo.installmentPlan", "name description")
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
      .populate("installmentInfo.installmentPlan", "name description")
      .exec()

    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`)
    }

    return order
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, userId: string): Promise<Order> {
    const order = (await this.findOne(id)) as any
    const oldStatus = order.status
    const newStatus = updateOrderStatusDto.status

    // Validate status transition
    this.validateStatusTransition(oldStatus, newStatus)

    // Use schema method to update status
    order.addStatusHistory(newStatus, updateOrderStatusDto.notes, userId)

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

    // Handle status-specific logic
    if (newStatus === OrderStatus.DELIVERED && !order.deliveredAt) {
      // Create a sale record when order is delivered
      try {
        const productIds = order.items.map((item) => item.product)

        await this.salesService.create(
          {
            order: order._id,
            customer: order.customer._id,
            products: productIds,
            amount: order.total,
            date: new Date().toISOString(),
            transaction: order.transaction,
            notes: `Sale created from order #${order.orderNumber} when marked as delivered`,
          },
          userId,
        )

        console.log(`Sale record created for order #${order.orderNumber}`)
      } catch (error) {
        console.error(`Failed to create sale record for order #${order.orderNumber}:`, error)
      }
    } else if (newStatus === OrderStatus.CANCELLED) {
      // Restore inventory
      for (const item of order.items) {
        await this.inventoryService.restoreStock(
          item.product.toString(),
          item.quantity,
          userId,
          `Order #${order.orderNumber} cancelled`,
        )
      }
    } else if (newStatus === OrderStatus.RETURNED) {
      // Restore inventory
      for (const item of order.items) {
        await this.inventoryService.restoreStock(
          item.product.toString(),
          item.quantity,
          userId,
          `Order #${order.orderNumber} returned`,
        )
      }
    } else if (newStatus === OrderStatus.REFUNDED) {
      order.paymentStatus = PaymentStatus.REFUNDED
    }

    const updatedOrder = await order.save()

    // Extract customer ID and send notification
    const customerId = this.extractCustomerId(order.customer)
    if (customerId) {
      try {
        const customer = await this.usersService.findById(customerId)

        await this.notificationsService.createNotification({
          user: customer._id.toString(),
          title: "Order Status Updated",
          message: `Your order #${order.orderNumber} status has been updated to ${newStatus}.`,
          type: "order",
          reference: order._id.toString(),
        })
      } catch (error) {
        console.error("Error sending notification:", error)
      }
    }

    // Log audit
    await this.auditService.createAuditLog({
      action: "UPDATE",
      userId,
      module: "ORDERS",
      description: `Order #${order.orderNumber} status updated from ${oldStatus} to ${newStatus}`,
      changes: JSON.stringify(updateOrderStatusDto),
    })

    return updatedOrder
  }

  async updatePaymentStatus(id: string, updatePaymentStatusDto: UpdatePaymentStatusDto, userId: string): Promise<Order> {
    const order = (await this.findOne(id)) as any
    const oldPaymentStatus = order.paymentStatus

    // Use schema method to update payment status
    order.updatePaymentStatus(
      updatePaymentStatusDto.paymentStatus,
      updatePaymentStatusDto.amount,
      updatePaymentStatusDto.paymentReference
    )

    // Update transaction if provided
    if (updatePaymentStatusDto.transactionId) {
      order.transaction = new Types.ObjectId(updatePaymentStatusDto.transactionId)
    }

    // Update payment method if provided
    if (updatePaymentStatusDto.paymentMethod) {
      order.paymentMethod = updatePaymentStatusDto.paymentMethod
    }

    // Update payment details if provided
    if (updatePaymentStatusDto.paymentDetails) {
      order.paymentDetails = updatePaymentStatusDto.paymentDetails
    }

    // Convert DTO enum to schema enum for comparison
    const dtoPaymentStatus = updatePaymentStatusDto.paymentStatus
    
    // If payment is successful and order is pending, move to processing
    if (dtoPaymentStatus === PaymentStatusEnum.PAID && order.status === OrderStatus.PENDING) {
      order.addStatusHistory(OrderStatus.PROCESSING, "Payment received, order processing", userId)
    }

    const updatedOrder = await order.save()

    // Send notification to customer
    const customerId = this.extractCustomerId(order.customer)
    if (customerId) {
      try {
        const customer = await this.usersService.findById(customerId)

        await this.notificationsService.createNotification({
          user: customer._id.toString(),
          title: "Payment Status Updated",
          message: `Payment for your order #${order.orderNumber} has been ${updatePaymentStatusDto.paymentStatus}.`,
          type: "payment",
          reference: order._id.toString(),
        })
      } catch (error) {
        console.error("Error sending notification:", error)
      }
    }

    // Log audit
    await this.auditService.createAuditLog({
      action: "UPDATE",
      userId,
      module: "ORDERS",
      description: `Order #${order.orderNumber} payment status updated from ${oldPaymentStatus} to ${updatePaymentStatusDto.paymentStatus}`,
      changes: JSON.stringify(updatePaymentStatusDto),
    })

    return updatedOrder
  }

  private extractCustomerId(customer: any): string | null {
    if (!customer) return null

    if (typeof customer === "string") {
      return customer
    }

    if (typeof customer === "object") {
      if (customer._id) {
        return customer._id.toString()
      }
      
      if (customer instanceof Types.ObjectId) {
        return customer.toString()
      }
      
      // Handle string representation of ObjectId
      const customerStr = customer.toString()
      const match = customerStr.match(/ObjectId\$\$'([0-9a-fA-F]{24})'\$\$/)
      if (match && match[1]) {
        return match[1]
      }
    }

    return null
  }

  private generateOrderNumber(): string {
    const prefix = "ORD"
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${prefix}-${timestamp}-${random}`
  }

  private validateStatusTransition(oldStatus: OrderStatus, newStatus: OrderStatus): void {
    // Define valid transitions - updated to include CONFIRMED status
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
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
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      installmentOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      installmentRevenue,
    ] = await Promise.all([
      this.orderModel.countDocuments().exec(),
      this.orderModel.countDocuments({ status: OrderStatus.PENDING }).exec(),
      this.orderModel.countDocuments({ status: OrderStatus.CONFIRMED }).exec(),
      this.orderModel.countDocuments({ status: OrderStatus.PROCESSING }).exec(),
      this.orderModel.countDocuments({ status: OrderStatus.SHIPPED }).exec(),
      this.orderModel.countDocuments({ status: OrderStatus.DELIVERED }).exec(),
      this.orderModel.countDocuments({ status: OrderStatus.CANCELLED }).exec(),
      this.orderModel.countDocuments({ paymentType: PaymentType.INSTALLMENT }).exec(),
      this.orderModel.countDocuments({ createdAt: { $gte: startOfDay } }).exec(),
      this.orderModel.countDocuments({ createdAt: { $gte: startOfWeek } }).exec(),
      this.orderModel.countDocuments({ createdAt: { $gte: startOfMonth } }).exec(),
      this.orderModel
        .aggregate([
          { $match: { paymentStatus: { $in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_PAID] } } },
          { $group: { _id: null, total: { $sum: "$paidAmount" } } },
        ])
        .exec(),
      this.orderModel
        .aggregate([
          { $match: { 
            paymentStatus: { $in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_PAID] }, 
            createdAt: { $gte: startOfDay } 
          }},
          { $group: { _id: null, total: { $sum: "$paidAmount" } } },
        ])
        .exec(),
      this.orderModel
        .aggregate([
          { $match: { 
            paymentStatus: { $in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_PAID] }, 
            createdAt: { $gte: startOfWeek } 
          }},
          { $group: { _id: null, total: { $sum: "$paidAmount" } } },
        ])
        .exec(),
      this.orderModel
        .aggregate([
          { $match: { 
            paymentStatus: { $in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_PAID] }, 
            createdAt: { $gte: startOfMonth } 
          }},
          { $group: { _id: null, total: { $sum: "$paidAmount" } } },
        ])
        .exec(),
      this.orderModel
        .aggregate([
          { $match: { 
            paymentType: PaymentType.INSTALLMENT,
            paymentStatus: { $in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_PAID] }
          }},
          { $group: { _id: null, total: { $sum: "$paidAmount" } } },
        ])
        .exec(),
    ])

    return {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        installment: installmentOrders,
        today: todayOrders,
        week: weekOrders,
        month: monthOrders,
      },
      revenue: {
        total: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        today: todayRevenue.length > 0 ? todayRevenue[0].total : 0,
        week: weekRevenue.length > 0 ? weekRevenue[0].total : 0,
        month: monthRevenue.length > 0 ? monthRevenue[0].total : 0,
        installment: installmentRevenue.length > 0 ? installmentRevenue[0].total : 0,
      },
    }
  }

  async getRecentOrders(limit = 10): Promise<Order[]> {
    return this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("customer", "firstName lastName email")
      .populate("installmentInfo.installmentPlan", "name")
      .exec()
  }

  async getInstallmentOrdersOverdue(): Promise<Order[]> {
    // This would need to be implemented based on your payment schedule logic
    // For now, returning empty array
    return []
  }

  async calculateInstallmentDetails(
    total: number,
    numberOfInstallments: number,
    downPaymentPercentage: number,
    interestRate: number
  ): Promise<any> {
    const downPayment = (total * downPaymentPercentage) / 100
    const remainingAmount = total - downPayment
    const monthlyInterestRate = interestRate / 12 / 100
    
    let installmentAmount: number
    let totalInterest: number
    
    if (monthlyInterestRate > 0) {
      // Calculate using compound interest formula
      const factor = Math.pow(1 + monthlyInterestRate, numberOfInstallments)
      installmentAmount = (remainingAmount * monthlyInterestRate * factor) / (factor - 1)
      totalInterest = installmentAmount * numberOfInstallments - remainingAmount
    } else {
      // No interest
      installmentAmount = remainingAmount / numberOfInstallments
      totalInterest = 0
    }
    
    const totalPayable = downPayment + installmentAmount * numberOfInstallments
    
    return {
      downPayment,
      installmentAmount,
      totalInterest,
      totalPayable,
      remainingAmount,
      monthlyPayment: installmentAmount
    }
  }
}