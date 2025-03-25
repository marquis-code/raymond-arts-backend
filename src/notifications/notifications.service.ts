import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { Notification } from "./schemas/notification.schema"
import type { CreateNotificationDto } from "./dto/create-notification.dto"
import type { UpdateNotificationDto } from "./dto/update-notification.dto"
import type { PaginationParams, PaginatedResult } from "../common/interfaces/pagination.interface"

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const newNotification = new this.notificationModel(createNotificationDto)
    return newNotification.save()
  }

  async createAdminNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const adminNotification = new this.notificationModel({
      ...createNotificationDto,
      isAdmin: true,
    })
    return adminNotification.save()
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Notification>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
    const skip = (page - 1) * limit

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find()
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "firstName lastName email")
        .exec(),
      this.notificationModel.countDocuments().exec(),
    ])

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findByUser(userId: string, params: PaginationParams): Promise<PaginatedResult<Notification>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
    const skip = (page - 1) * limit

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find({ user: userId })
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ user: userId }).exec(),
    ])

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findAdminNotifications(params: PaginationParams): Promise<PaginatedResult<Notification>> {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = params
    const skip = (page - 1) * limit

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find({ isAdmin: true })
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ isAdmin: true }).exec(),
    ])

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id).populate("user", "firstName lastName email").exec()

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`)
    }

    return notification
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.notificationModel.findByIdAndUpdate(id, updateNotificationDto, { new: true }).exec()

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`)
    }

    return notification
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true }).exec()

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`)
    }

    return notification
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany({ user: userId, isRead: false }, { isRead: true }).exec()
  }

  async remove(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findByIdAndDelete(id).exec()

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`)
    }

    return notification
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ user: userId, isRead: false }).exec()
  }
}

