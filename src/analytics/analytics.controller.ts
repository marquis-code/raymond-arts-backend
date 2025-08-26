import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsEventDto, AnalyticsQueryDto } from './dto/analytics-event.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(ThrottlerGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track an analytics event' })
  @ApiResponse({ status: 201, description: 'Event tracked successfully' })
  async trackEvent(@Body() eventData: CreateAnalyticsEventDto, @Req() req: Request) {
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    return await this.analyticsService.trackEvent(eventData, ipAddress);
  }

  @Get('events')
  @ApiOperation({ summary: 'Get analytics events with filters' })
  @ApiResponse({ status: 200, description: 'Returns filtered analytics events' })
  async getAnalyticsData(@Query() query: AnalyticsQueryDto) {
    return await this.analyticsService.getAnalyticsData(query);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Returns dashboard statistics' })
  async getDashboardStats(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days) : 7;
    return await this.analyticsService.getDashboardStats(daysNumber);
  }

  @Get('pages')
  @ApiOperation({ summary: 'Get page analytics' })
  @ApiResponse({ status: 200, description: 'Returns page analytics data' })
  async getPageAnalytics() {
    return await this.analyticsService.getPageAnalytics();
  }

  @Get('realtime')
  @ApiOperation({ summary: 'Get real-time statistics' })
  @ApiResponse({ status: 200, description: 'Returns real-time analytics' })
  async getRealTimeStats() {
    return await this.analyticsService.getRealTimeStats();
  }

  @Get('browsers')
  @ApiOperation({ summary: 'Get browser statistics' })
  @ApiResponse({ status: 200, description: 'Returns browser usage statistics' })
  async getBrowserStats(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days) : 7;
    return await this.analyticsService.getBrowserStats(daysNumber);
  }

  @Get('devices')
  @ApiOperation({ summary: 'Get device statistics' })
  @ApiResponse({ status: 200, description: 'Returns device usage statistics' })
  async getDeviceStats(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days) : 7;
    return await this.analyticsService.getDeviceStats(daysNumber);
  }
}