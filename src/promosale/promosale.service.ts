// import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import { PromoSale, PromoSaleDocument, PromoSaleStatus } from './schemas/promosale.schema';
// import { CreatePromoSaleDto } from './dto/create-promosale.dto';
// import { UpdatePromoSaleDto } from './dto/update-promosale.dto';

// @Injectable()
// export class PromoSaleService {
//   private readonly logger = new Logger(PromoSaleService.name);

//   constructor(
//     @InjectModel(PromoSale.name) private promoSaleModel: Model<PromoSaleDocument>,
//   ) {}

//   async create(createPromoSaleDto: CreatePromoSaleDto): Promise<PromoSale> {
//     const startDate = new Date(createPromoSaleDto.startDate);
//     const endDate = createPromoSaleDto.endDate ? new Date(createPromoSaleDto.endDate) : null;
    
//     // Validate dates
//     if (endDate && startDate >= endDate) {
//       throw new ConflictException('End date must be after start date');
//     }

//     // Check for overlapping active promos
//     const overlappingPromo = await this.findOverlappingPromo(startDate, endDate);
//     if (overlappingPromo) {
//       throw new ConflictException(
//         `Another promo "${overlappingPromo.title}" is already scheduled for this time period`
//       );
//     }

//     // Determine initial status based on current date/time
//     const now = new Date();
//     let initialStatus: PromoSaleStatus;
    
//     if (startDate > now) {
//       // Promo hasn't started yet
//       initialStatus = PromoSaleStatus.PENDING;
//     } else if (!endDate || endDate > now) {
//       // Promo should be active now (either lifetime or within time range)
//       initialStatus = PromoSaleStatus.ACTIVE;
//     } else {
//       // Promo has already expired
//       initialStatus = PromoSaleStatus.EXPIRED;
//     }

//     const promoSale = new this.promoSaleModel({
//       ...createPromoSaleDto,
//       startDate,
//       actionText: createPromoSaleDto.actionText,
//       endDate,
//       isLifetime: !endDate || createPromoSaleDto.isLifetime,
//       status: initialStatus,
//       isActive: initialStatus === PromoSaleStatus.ACTIVE,
//     });

//     const savedPromo = await promoSale.save();
    
//     // If this promo should be active now, deactivate others
//     if (savedPromo.status === PromoSaleStatus.ACTIVE && savedPromo.isActive) {
//     //   await this.deactivateOtherPromos(savedPromo._id);
//     await this.deactivateOtherPromos(savedPromo._id.toString());
//     }

//     this.logger.log(`Created new promo sale: ${savedPromo.title}`);
//     return savedPromo;
//   }

//   async findAll(): Promise<PromoSale[]> {
//     return this.promoSaleModel
//       .find()
//       .sort({ priority: -1, createdAt: -1 })
//       .exec();
//   }

//   async findActive(): Promise<PromoSale | {}> {
//     // Only return promos that are currently active and running
//     const now = new Date();
    
//     const activePromo = await this.promoSaleModel
//       .findOne({ 
//         status: PromoSaleStatus.ACTIVE,
//         isActive: true,
//         startDate: { $lte: now }, // Must have started
//         $or: [
//           { isLifetime: true }, // Lifetime promos never expire
//           { endDate: { $gt: now } }, // Timed promos that haven't expired yet
//           { endDate: null } // Handle null end dates as lifetime
//         ]
//       })
//       .exec();
  
//     return activePromo || {};
//   }

//   async findOne(id: string): Promise<PromoSale> {
//     const promoSale = await this.promoSaleModel.findById(id).exec();
//     if (!promoSale) {
//       throw new NotFoundException(`PromoSale with ID ${id} not found`);
//     }
//     return promoSale;
//   }


//   async update(id: string, updatePromoSaleDto: UpdatePromoSaleDto): Promise<PromoSale> {
//     const existingPromo = await this.findOne(id);
    
//     if (updatePromoSaleDto.startDate || updatePromoSaleDto.endDate) {
//       const startDate = updatePromoSaleDto.startDate 
//         ? new Date(updatePromoSaleDto.startDate) 
//         : existingPromo.startDate;
//       const endDate = updatePromoSaleDto.endDate 
//         ? new Date(updatePromoSaleDto.endDate) 
//         : existingPromo.endDate;

//       if (endDate && startDate >= endDate) {
//         throw new ConflictException('End date must be after start date');
//       }

//       // Check for overlapping promos (excluding current one)
//       const overlappingPromo = await this.findOverlappingPromo(startDate, endDate, id);
//       if (overlappingPromo) {
//         throw new ConflictException(
//           `Another promo "${overlappingPromo.title}" is already scheduled for this time period`
//         );
//       }
//     }

//     // Prepare update data with actionText if provided
//     const updateData = {
//       ...updatePromoSaleDto,
//       ...(updatePromoSaleDto.actionText && { actionText: updatePromoSaleDto.actionText })
//     };

//     const updatedPromo = await this.promoSaleModel
//       .findByIdAndUpdate(id, updateData, { new: true })
//       .exec();

//     this.logger.log(`Updated promo sale: ${updatedPromo.title} with action text: ${updatedPromo.actionText}`);
//     return updatedPromo;
//   }

//   async remove(id: string): Promise<void> {
//     const promoSale = await this.findOne(id);
//     await this.promoSaleModel.findByIdAndDelete(id).exec();
//     this.logger.log(`Deleted promo sale: ${promoSale.title}`);
//   }

//   async activatePromo(id: string): Promise<PromoSale> {
//     const promo = await this.findOne(id);
    
//     // Deactivate other promos first
//     await this.deactivateOtherPromos(id);
    
//     const updatedPromo = await this.promoSaleModel
//       .findByIdAndUpdate(
//         id, 
//         { 
//           status: PromoSaleStatus.ACTIVE,
//           isActive: true 
//         }, 
//         { new: true }
//       )
//       .exec();

//     this.logger.log(`Manually activated promo: ${updatedPromo.title}`);
//     return updatedPromo;
//   }

//   async deactivatePromo(id: string): Promise<PromoSale> {
//     const updatedPromo = await this.promoSaleModel
//       .findByIdAndUpdate(
//         id, 
//         { 
//           status: PromoSaleStatus.CANCELLED,
//           isActive: false 
//         }, 
//         { new: true }
//       )
//       .exec();

//     this.logger.log(`Manually deactivated promo: ${updatedPromo.title}`);
    
//     // Activate next pending promo if available
//     await this.activateNextPendingPromo();
    
//     return updatedPromo;
//   }

//   // Cron job runs every minute to check promo status based on exact date and time
//   @Cron(CronExpression.EVERY_MINUTE)
//   async updatePromoStatuses(): Promise<void> {
//     const now = new Date();
//     this.logger.debug(`Running promo status update cron job at: ${now.toISOString()}`);

//     try {
//       // 1. EXPIRE ACTIVE PROMOS: Check if any active promo has reached its end date/time
//       const expiredPromos = await this.promoSaleModel
//         .find({
//           status: PromoSaleStatus.ACTIVE,
//           isActive: true,
//           endDate: { $lte: now }, // End date/time has passed
//           isLifetime: false, // Exclude lifetime promos
//         })
//         .exec();

//       if (expiredPromos.length > 0) {
//         this.logger.log(`Found ${expiredPromos.length} expired promo(s)`);
        
//         for (const promo of expiredPromos) {
//           await this.promoSaleModel
//             .findByIdAndUpdate(promo._id, {
//               status: PromoSaleStatus.EXPIRED,
//               isActive: false,
//             })
//             .exec();
          
//           this.logger.log(`Expired promo: "${promo.title}" at ${now.toISOString()}`);
//         }

//         // After expiring promos, try to activate the next pending one
//         await this.activateNextPendingPromo();
//       }

//       // 2. ACTIVATE PENDING PROMOS: Check if any pending promo should start now
//       const currentActivePromo = await this.findActive();
      
//       if (!currentActivePromo) {
//         // No active promo, check for pending promos that should start
//         const promoToActivate = await this.promoSaleModel
//           .findOne({
//             status: PromoSaleStatus.PENDING,
//             startDate: { $lte: now }, // Start date/time has arrived
//             isActive: false,
//           })
//           .sort({ priority: -1, startDate: 1 }) // Highest priority first, then earliest start date
//           .exec();

//         if (promoToActivate) {
//           await this.promoSaleModel
//             .findByIdAndUpdate(promoToActivate._id, {
//               status: PromoSaleStatus.ACTIVE,
//               isActive: true,
//             })
//             .exec();
          
//           this.logger.log(`Activated promo: "${promoToActivate.title}" at ${now.toISOString()}`);
//         }
//       }

//       // 3. LOG CURRENT STATUS
//       const activeCount = await this.promoSaleModel.countDocuments({ 
//         status: PromoSaleStatus.ACTIVE, 
//         isActive: true 
//       });
      
//       if (activeCount > 1) {
//         this.logger.warn(`WARNING: Multiple active promos detected (${activeCount}). Fixing...`);
//         await this.ensureSingleActivePromo();
//       }

//     } catch (error) {
//       this.logger.error('Error updating promo statuses:', error);
//     }
//   }

//   private async findOverlappingPromo(
//     startDate: Date, 
//     endDate: Date | null, 
//     excludeId?: string
//   ): Promise<PromoSale | null> {
//     const query: any = {
//       status: { $in: [PromoSaleStatus.PENDING, PromoSaleStatus.ACTIVE] },
//       $or: [
//         // Case 1: Existing promo starts during new promo period
//         {
//           startDate: {
//             $gte: startDate,
//             ...(endDate && { $lt: endDate }),
//           },
//         },
//         // Case 2: New promo starts during existing promo period
//         {
//           $and: [
//             { startDate: { $lte: startDate } },
//             {
//               $or: [
//                 { isLifetime: true },
//                 { endDate: { $gt: startDate } },
//               ],
//             },
//           ],
//         },
//       ],
//     };

//     if (excludeId) {
//       query._id = { $ne: excludeId };
//     }

//     return this.promoSaleModel.findOne(query).exec();
//   }

//   private async deactivateOtherPromos(excludeId: string): Promise<void> {
//     await this.promoSaleModel
//       .updateMany(
//         { 
//           _id: { $ne: excludeId },
//           status: PromoSaleStatus.ACTIVE 
//         },
//         { 
//           status: PromoSaleStatus.EXPIRED,
//           isActive: false 
//         }
//       )
//       .exec();
//   }

//   private async activateNextPendingPromo(): Promise<void> {
//     const now = new Date();
    
//     // Find the next promo that should be activated based on date/time and priority
//     const nextPromo = await this.promoSaleModel
//       .findOne({
//         status: PromoSaleStatus.PENDING,
//         startDate: { $lte: now }, // Start date/time has arrived
//         isActive: false,
//       })
//       .sort({ priority: -1, startDate: 1 }) // Highest priority first, then earliest start
//       .exec();

//     if (nextPromo) {
//       await this.promoSaleModel
//         .findByIdAndUpdate(nextPromo._id, {
//           status: PromoSaleStatus.ACTIVE,
//           isActive: true,
//         })
//         .exec();
      
//       this.logger.log(`Auto-activated next promo: "${nextPromo.title}" at ${now.toISOString()}`);
//     } else {
//       this.logger.debug('No pending promos ready for activation');
//     }
//   }

//   // Ensure only one promo is active at a time
//   private async ensureSingleActivePromo(): Promise<void> {
//     const activePromos = await this.promoSaleModel
//       .find({ 
//         status: PromoSaleStatus.ACTIVE, 
//         isActive: true 
//       })
//       .sort({ priority: -1, startDate: 1 })
//       .exec();

//     if (activePromos.length > 1) {
//       // Keep the highest priority one, deactivate others
//       const [keepActive, ...deactivatePromos] = activePromos;
      
//       for (const promo of deactivatePromos) {
//         await this.promoSaleModel
//           .findByIdAndUpdate(promo._id, {
//             status: PromoSaleStatus.EXPIRED,
//             isActive: false,
//           })
//           .exec();
        
//         this.logger.log(`Deactivated duplicate active promo: "${promo.title}"`);
//       }
      
//       this.logger.log(`Kept active promo: "${keepActive.title}"`);
//     }
//   }

//   // Helper method to get all promos with their action texts
//   async getAllPromosWithActionText(): Promise<Array<{ id: string; title: string; actionText: string; status: PromoSaleStatus }>> {
//     const promos = await this.promoSaleModel
//       .find()
//       .select('title actionText status')
//       .sort({ priority: -1, createdAt: -1 })
//       .exec();

//     return promos.map(promo => ({
//       id: promo._id.toString(),
//       title: promo.title,
//       actionText: promo.actionText,
//       status: promo.status
//     }));
//   }
// }


import { Injectable, Logger, ConflictException, NotFoundException } from "@nestjs/common"
import { Model } from "mongoose"
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from "@nestjs/schedule"
import { PromoSale, PromoSaleDocument, PromoSaleStatus } from "./schemas/promosale.schema"
import { CreatePromoSaleDto } from "./dto/create-promosale.dto"
import { UpdatePromoSaleDto } from "./dto/update-promosale.dto"
import { RedisService } from "../redis/redis.service"

@Injectable()
export class PromoSaleService {
  private readonly logger = new Logger(PromoSaleService.name)

  constructor(
    @InjectModel(PromoSale.name) private promoSaleModel: Model<PromoSaleDocument>,
    private readonly redisService: RedisService,
  ) {}

  async create(createPromoSaleDto: CreatePromoSaleDto): Promise<PromoSale> {
    const startDate = new Date(createPromoSaleDto.startDate)
    const endDate = createPromoSaleDto.endDate ? new Date(createPromoSaleDto.endDate) : null

    // Validate dates
    if (endDate && startDate >= endDate) {
      throw new ConflictException("End date must be after start date")
    }

    // Check for overlapping active promos
    const overlappingPromo = await this.findOverlappingPromo(startDate, endDate)
    if (overlappingPromo) {
      throw new ConflictException(`Another promo "${overlappingPromo.title}" is already scheduled for this time period`)
    }

    // Determine initial status based on current date/time
    const now = new Date()
    let initialStatus: PromoSaleStatus

    if (startDate > now) {
      initialStatus = PromoSaleStatus.PENDING
    } else if (!endDate || endDate > now) {
      initialStatus = PromoSaleStatus.ACTIVE
    } else {
      initialStatus = PromoSaleStatus.EXPIRED
    }

    const promoSale = new this.promoSaleModel({
      ...createPromoSaleDto,
      startDate,
      actionText: createPromoSaleDto.actionText,
      endDate,
      isLifetime: !endDate || createPromoSaleDto.isLifetime,
      status: initialStatus,
      isActive: initialStatus === PromoSaleStatus.ACTIVE,
    })

    const savedPromo = await promoSale.save()

    // If this promo should be active now, deactivate others
    if (savedPromo.status === PromoSaleStatus.ACTIVE && savedPromo.isActive) {
      await this.deactivateOtherPromos(savedPromo._id.toString())
    }

    await this.invalidatePromoCaches()

    this.logger.log(`Created new promo sale: ${savedPromo.title}`)
    return savedPromo
  }

  async findAll(): Promise<PromoSale[]> {
    const cacheKey = this.redisService.generateKey("promos", "all")

    try {
      const cached = await this.redisService.get<PromoSale[]>(cacheKey)
      if (cached) {
        this.logger.debug("Returning cached promos list")
        return cached
      }
    } catch (error) {
      this.logger.warn("Cache get failed for promos list:", error)
    }

    const promos = await this.promoSaleModel.find().sort({ priority: -1, createdAt: -1 }).exec()

    try {
      await this.redisService.set(cacheKey, promos, 900) // 15 minutes
    } catch (error) {
      this.logger.warn("Cache set failed for promos list:", error)
    }

    return promos
  }

  async findActive(): Promise<PromoSale | {}> {
    const cacheKey = this.redisService.generateKey("promos", "active")

    try {
      const cached = await this.redisService.get<PromoSale | {}>(cacheKey)
      if (cached) {
        this.logger.debug("Returning cached active promo")
        return cached
      }
    } catch (error) {
      this.logger.warn("Cache get failed for active promo:", error)
    }

    const now = new Date()

    const activePromo = await this.promoSaleModel
      .findOne({
        status: PromoSaleStatus.ACTIVE,
        isActive: true,
        startDate: { $lte: now },
        $or: [{ isLifetime: true }, { endDate: { $gt: now } }, { endDate: null }],
      })
      .exec()

    const result = activePromo || {}

    try {
      await this.redisService.set(cacheKey, result, 300) // 5 minutes
    } catch (error) {
      this.logger.warn("Cache set failed for active promo:", error)
    }

    return result
  }

  async findOne(id: string): Promise<PromoSale> {
    const cacheKey = this.redisService.generateKey("promos", "single", id)

    try {
      const cached = await this.redisService.get<PromoSale>(cacheKey)
      if (cached) {
        this.logger.debug(`Returning cached promo: ${id}`)
        return cached
      }
    } catch (error) {
      this.logger.warn(`Cache get failed for promo ${id}:`, error)
    }

    const promoSale = await this.promoSaleModel.findById(id).exec()
    if (!promoSale) {
      throw new NotFoundException(`PromoSale with ID ${id} not found`)
    }

    try {
      await this.redisService.set(cacheKey, promoSale, 600) // 10 minutes
    } catch (error) {
      this.logger.warn(`Cache set failed for promo ${id}:`, error)
    }

    return promoSale
  }

  async update(id: string, updatePromoSaleDto: UpdatePromoSaleDto): Promise<PromoSale> {
    const existingPromo = await this.findOne(id)

    if (updatePromoSaleDto.startDate || updatePromoSaleDto.endDate) {
      const startDate = updatePromoSaleDto.startDate ? new Date(updatePromoSaleDto.startDate) : existingPromo.startDate
      const endDate = updatePromoSaleDto.endDate ? new Date(updatePromoSaleDto.endDate) : existingPromo.endDate

      if (endDate && startDate >= endDate) {
        throw new ConflictException("End date must be after start date")
      }

      const overlappingPromo = await this.findOverlappingPromo(startDate, endDate, id)
      if (overlappingPromo) {
        throw new ConflictException(
          `Another promo "${overlappingPromo.title}" is already scheduled for this time period`,
        )
      }
    }

    const updateData = {
      ...updatePromoSaleDto,
      ...(updatePromoSaleDto.actionText && { actionText: updatePromoSaleDto.actionText }),
    }

    const updatedPromo = await this.promoSaleModel.findByIdAndUpdate(id, updateData, { new: true }).exec()

    await this.invalidatePromoCaches(id)

    this.logger.log(`Updated promo sale: ${updatedPromo.title} with action text: ${updatedPromo.actionText}`)
    return updatedPromo
  }

  async remove(id: string): Promise<void> {
    const promoSale = await this.findOne(id)
    await this.promoSaleModel.findByIdAndDelete(id).exec()

    await this.invalidatePromoCaches(id)

    this.logger.log(`Deleted promo sale: ${promoSale.title}`)
  }

  async activatePromo(id: string): Promise<PromoSale> {
    const promo = await this.findOne(id)

    await this.deactivateOtherPromos(id)

    const updatedPromo = await this.promoSaleModel
      .findByIdAndUpdate(
        id,
        {
          status: PromoSaleStatus.ACTIVE,
          isActive: true,
        },
        { new: true },
      )
      .exec()

    await this.invalidatePromoCaches()

    this.logger.log(`Manually activated promo: ${updatedPromo.title}`)
    return updatedPromo
  }

  async deactivatePromo(id: string): Promise<PromoSale> {
    const updatedPromo = await this.promoSaleModel
      .findByIdAndUpdate(
        id,
        {
          status: PromoSaleStatus.CANCELLED,
          isActive: false,
        },
        { new: true },
      )
      .exec()

    this.logger.log(`Manually deactivated promo: ${updatedPromo.title}`)

    await this.activateNextPendingPromo()

    await this.invalidatePromoCaches()

    return updatedPromo
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updatePromoStatuses(): Promise<void> {
    const now = new Date()
    this.logger.debug(`Running promo status update cron job at: ${now.toISOString()}`)

    let cacheInvalidationNeeded = false

    try {
      const expiredPromos = await this.promoSaleModel
        .find({
          status: PromoSaleStatus.ACTIVE,
          isActive: true,
          endDate: { $lte: now },
          isLifetime: false,
        })
        .exec()

      if (expiredPromos.length > 0) {
        this.logger.log(`Found ${expiredPromos.length} expired promo(s)`)

        for (const promo of expiredPromos) {
          await this.promoSaleModel
            .findByIdAndUpdate(promo._id, {
              status: PromoSaleStatus.EXPIRED,
              isActive: false,
            })
            .exec()

          this.logger.log(`Expired promo: "${promo.title}" at ${now.toISOString()}`)
        }

        cacheInvalidationNeeded = true
        await this.activateNextPendingPromo()
      }

      const currentActivePromo = await this.promoSaleModel
        .findOne({
          status: PromoSaleStatus.ACTIVE,
          isActive: true,
        })
        .exec()

      if (!currentActivePromo) {
        const promoToActivate = await this.promoSaleModel
          .findOne({
            status: PromoSaleStatus.PENDING,
            startDate: { $lte: now },
            isActive: false,
          })
          .sort({ priority: -1, startDate: 1 })
          .exec()

        if (promoToActivate) {
          await this.promoSaleModel
            .findByIdAndUpdate(promoToActivate._id, {
              status: PromoSaleStatus.ACTIVE,
              isActive: true,
            })
            .exec()

          cacheInvalidationNeeded = true
          this.logger.log(`Activated promo: "${promoToActivate.title}" at ${now.toISOString()}`)
        }
      }

      const activeCount = await this.promoSaleModel.countDocuments({
        status: PromoSaleStatus.ACTIVE,
        isActive: true,
      })

      if (activeCount > 1) {
        this.logger.warn(`WARNING: Multiple active promos detected (${activeCount}). Fixing...`)
        await this.ensureSingleActivePromo()
        cacheInvalidationNeeded = true
      }

      if (cacheInvalidationNeeded) {
        await this.invalidatePromoCaches()
      }
    } catch (error) {
      this.logger.error("Error updating promo statuses:", error)
    }
  }

  async getAllPromosWithActionText(): Promise<
    Array<{ id: string; title: string; actionText: string; status: PromoSaleStatus }>
  > {
    const cacheKey = this.redisService.generateKey("promos", "action-texts")

    try {
      const cached =
        await this.redisService.get<Array<{ id: string; title: string; actionText: string; status: PromoSaleStatus }>>(
          cacheKey,
        )
      if (cached) {
        this.logger.debug("Returning cached promos with action text")
        return cached
      }
    } catch (error) {
      this.logger.warn("Cache get failed for promos with action text:", error)
    }

    const promos = await this.promoSaleModel
      .find()
      .select("title actionText status")
      .sort({ priority: -1, createdAt: -1 })
      .exec()

    const result = promos.map((promo) => ({
      id: promo._id.toString(),
      title: promo.title,
      actionText: promo.actionText,
      status: promo.status,
    }))

    try {
      await this.redisService.set(cacheKey, result, 600) // 10 minutes
    } catch (error) {
      this.logger.warn("Cache set failed for promos with action text:", error)
    }

    return result
  }

  private async invalidatePromoCaches(specificId?: string): Promise<void> {
    try {
      const cacheKeys = [
        this.redisService.generateKey("promos", "all"),
        this.redisService.generateKey("promos", "active"),
        this.redisService.generateKey("promos", "action-texts"),
      ]

      if (specificId) {
        cacheKeys.push(this.redisService.generateKey("promos", "single", specificId))
      }

      for (const key of cacheKeys) {
        await this.redisService.del(key)
      }

      this.logger.debug("Invalidated promo caches")
    } catch (error) {
      this.logger.warn("Error invalidating promo caches:", error)
    }
  }

  private async findOverlappingPromo(
    startDate: Date,
    endDate: Date | null,
    excludeId?: string,
  ): Promise<PromoSale | null> {
    const query: any = {
      status: { $in: [PromoSaleStatus.PENDING, PromoSaleStatus.ACTIVE] },
      $or: [
        {
          startDate: {
            $gte: startDate,
            ...(endDate && { $lt: endDate }),
          },
        },
        {
          $and: [
            { startDate: { $lte: startDate } },
            {
              $or: [{ isLifetime: true }, { endDate: { $gt: startDate } }],
            },
          ],
        },
      ],
    }

    if (excludeId) {
      query._id = { $ne: excludeId }
    }

    return this.promoSaleModel.findOne(query).exec()
  }

  private async deactivateOtherPromos(excludeId: string): Promise<void> {
    await this.promoSaleModel
      .updateMany(
        {
          _id: { $ne: excludeId },
          status: PromoSaleStatus.ACTIVE,
        },
        {
          status: PromoSaleStatus.EXPIRED,
          isActive: false,
        },
      )
      .exec()
  }

  private async activateNextPendingPromo(): Promise<void> {
    const now = new Date()

    const nextPromo = await this.promoSaleModel
      .findOne({
        status: PromoSaleStatus.PENDING,
        startDate: { $lte: now },
        isActive: false,
      })
      .sort({ priority: -1, startDate: 1 })
      .exec()

    if (nextPromo) {
      await this.promoSaleModel
        .findByIdAndUpdate(nextPromo._id, {
          status: PromoSaleStatus.ACTIVE,
          isActive: true,
        })
        .exec()

      this.logger.log(`Auto-activated next promo: "${nextPromo.title}" at ${now.toISOString()}`)
    } else {
      this.logger.debug("No pending promos ready for activation")
    }
  }

  private async ensureSingleActivePromo(): Promise<void> {
    const activePromos = await this.promoSaleModel
      .find({
        status: PromoSaleStatus.ACTIVE,
        isActive: true,
      })
      .sort({ priority: -1, startDate: 1 })
      .exec()

    if (activePromos.length > 1) {
      const [keepActive, ...deactivatePromos] = activePromos

      for (const promo of deactivatePromos) {
        await this.promoSaleModel
          .findByIdAndUpdate(promo._id, {
            status: PromoSaleStatus.EXPIRED,
            isActive: false,
          })
          .exec()

        this.logger.log(`Deactivated duplicate active promo: "${promo.title}"`)
      }

      this.logger.log(`Kept active promo: "${keepActive.title}"`)
    }
  }
}
