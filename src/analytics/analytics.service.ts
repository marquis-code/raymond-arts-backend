import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnalyticsEvent, AnalyticsEventDocument } from './schemas/analytics-event.schema';
import { PageAnalytics, PageAnalyticsDocument } from './schemas/page-analytics.schema';
import { CreateAnalyticsEventDto, AnalyticsQueryDto } from './dto/analytics-event.dto';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(AnalyticsEvent.name)
    private analyticsEventModel: Model<AnalyticsEventDocument>,
    @InjectModel(PageAnalytics.name)
    private pageAnalyticsModel: Model<PageAnalyticsDocument>,
  ) {}

  async trackEvent(eventData: CreateAnalyticsEventDto, ipAddress: string): Promise<AnalyticsEvent> {
    const event = new this.analyticsEventModel({
      ...eventData,
      ipAddress,
      timestamp: new Date(),
    });

    const savedEvent = await event.save();

    // Update page analytics if it's a page view
    if (eventData.eventType === 'page_view') {
      await this.updatePageAnalytics(eventData.page);
    }

    return savedEvent;
  }

  private async updatePageAnalytics(page: string): Promise<void> {
    await this.pageAnalyticsModel.findOneAndUpdate(
      { page },
      {
        $inc: { totalViews: 1 },
        $set: { lastUpdated: new Date() },
      },
      { upsert: true }
    );
  }

  async getAnalyticsData(query: AnalyticsQueryDto) {
    const filter: any = {};
    
    if (query.startDate || query.endDate) {
      filter.timestamp = {};
      if (query.startDate) {
        filter.timestamp.$gte = startOfDay(new Date(query.startDate));
      }
      if (query.endDate) {
        filter.timestamp.$lte = endOfDay(new Date(query.endDate));
      }
    }

    if (query.page) {
      filter.page = query.page;
    }

    if (query.eventType) {
      filter.eventType = query.eventType;
    }

    return await this.analyticsEventModel.find(filter).sort({ timestamp: -1 }).exec();
  }

  async getDashboardStats(days: number = 7) {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const [totalEvents, pageViews, topPages, dailyStats] = await Promise.all([
      this.getTotalEvents(startDate, endDate),
      this.getPageViews(startDate, endDate),
      this.getTopPages(startDate, endDate),
      this.getDailyStats(startDate, endDate),
    ]);

    return {
      totalEvents,
      pageViews,
      topPages,
      dailyStats,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  }

  private async getTotalEvents(startDate: Date, endDate: Date): Promise<number> {
    return await this.analyticsEventModel.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate },
    });
  }

  private async getPageViews(startDate: Date, endDate: Date): Promise<number> {
    return await this.analyticsEventModel.countDocuments({
      eventType: 'page_view',
      timestamp: { $gte: startDate, $lte: endDate },
    });
  }

  private async getTopPages(startDate: Date, endDate: Date, limit: number = 10) {
    return await this.analyticsEventModel.aggregate([
      {
        $match: {
          eventType: 'page_view',
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$page',
          views: { $sum: 1 },
          uniqueViews: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          page: '$_id',
          views: 1,
          uniqueViews: { $size: '$uniqueViews' },
          _id: 0,
        },
      },
      { $sort: { views: -1 } },
      { $limit: limit },
    ]);
  }

  private async getDailyStats(startDate: Date, endDate: Date) {
    return await this.analyticsEventModel.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          totalEvents: { $sum: 1 },
          pageViews: {
            $sum: { $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0] },
          },
          uniqueSessions: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          date: '$_id',
          totalEvents: 1,
          pageViews: 1,
          uniqueSessions: { $size: '$uniqueSessions' },
          _id: 0,
        },
      },
      { $sort: { date: 1 } },
    ]);
  }

  async getPageAnalytics(): Promise<PageAnalytics[]> {
    return await this.pageAnalyticsModel.find().sort({ totalViews: -1 }).exec();
  }

  async getRealTimeStats() {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const [activeUsers, recentEvents] = await Promise.all([
      this.analyticsEventModel.distinct('sessionId', {
        timestamp: { $gte: fiveMinutesAgo },
      }),
      this.analyticsEventModel.find({
        timestamp: { $gte: fiveMinutesAgo },
      }).sort({ timestamp: -1 }).limit(20),
    ]);

    return {
      activeUsers: activeUsers.length,
      recentEvents,
      timestamp: now,
    };
  }

  async getBrowserStats(days: number = 7) {
    const startDate = subDays(new Date(), days);
    
    return await this.analyticsEventModel.aggregate([
      {
        $match: {
          eventType: 'page_view',
          timestamp: { $gte: startDate },
          browser: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$browser',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          browser: '$_id',
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  async getDeviceStats(days: number = 7) {
    const startDate = subDays(new Date(), days);
    
    return await this.analyticsEventModel.aggregate([
      {
        $match: {
          eventType: 'page_view',
          timestamp: { $gte: startDate },
          device: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$device',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          device: '$_id',
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);
  }
}