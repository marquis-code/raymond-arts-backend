import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShippingConfig } from './schemas/shipping-config.schema';
import { TaxConfig } from './schemas/tax-config.schema';
import { CreateShippingConfigDto } from './dto/create-shipping-config.dto';
import { CreateTaxConfigDto } from './dto/create-tax-config.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ShippingTaxService {
  constructor(
    @InjectModel(ShippingConfig.name) private shippingConfigModel: Model<ShippingConfig>,
    @InjectModel(TaxConfig.name) private taxConfigModel: Model<TaxConfig>,
    private auditService: AuditService,
  ) {
    // Initialize default configurations
    this.initializeDefaultConfigs();
  }

  private async initializeDefaultConfigs(): Promise<void> {
    const shippingCount = await this.shippingConfigModel.countDocuments();
    const taxCount = await this.taxConfigModel.countDocuments();

    if (shippingCount === 0) {
      // Create default US shipping config
      await this.shippingConfigModel.create({
        countryCode: 'US',
        countryName: 'United States',
        shippingRate: 50,
        isActive: true,
      });

      // Create default international shipping config
      await this.shippingConfigModel.create({
        countryCode: 'DEFAULT',
        countryName: 'International',
        shippingRate: 60,
        isActive: true,
      });
    }

    if (taxCount === 0) {
      // Create default US tax config
      await this.taxConfigModel.create({
        countryCode: 'US',
        countryName: 'United States',
        vatRate: 2.5,
        isActive: true,
      });

      // Create default international tax config
      await this.taxConfigModel.create({
        countryCode: 'DEFAULT',
        countryName: 'International',
        vatRate: 2.5,
        isActive: true,
      });
    }
  }

  async getShippingRate(countryCode: string): Promise<number> {
    // Try to find country-specific shipping rate
    const countryConfig = await this.shippingConfigModel.findOne({
      countryCode: countryCode,
      isActive: true,
    });

    if (countryConfig) {
      return countryConfig.shippingRate;
    }

    // Fall back to default international rate
    const defaultConfig = await this.shippingConfigModel.findOne({
      countryCode: 'DEFAULT',
      isActive: true,
    });

    if (!defaultConfig) {
      // If no default config exists, return a standard rate
      return 60;
    }

    return defaultConfig.shippingRate;
  }

  async getVatRate(countryCode: string): Promise<number> {
    // Try to find country-specific VAT rate
    const countryConfig = await this.taxConfigModel.findOne({
      countryCode: countryCode,
      isActive: true,
    });

    if (countryConfig) {
      return countryConfig.vatRate;
    }

    // Fall back to default international rate
    const defaultConfig = await this.taxConfigModel.findOne({
      countryCode: 'DEFAULT',
      isActive: true,
    });

    if (!defaultConfig) {
      // If no default config exists, return a standard rate
      return 2.5;
    }

    return defaultConfig.vatRate;
  }

  async createShippingConfig(createShippingConfigDto: CreateShippingConfigDto, userId: string): Promise<ShippingConfig> {
    const newConfig = new this.shippingConfigModel({
      ...createShippingConfigDto,
      createdBy: userId,
    });

    const savedConfig = await newConfig.save();

    // Log audit
    await this.auditService.createAuditLog({
      action: 'CREATE',
      userId,
      module: 'SHIPPING_CONFIG',
      description: `Shipping config created for ${createShippingConfigDto.countryName}`,
    });

    return savedConfig;
  }

  async createTaxConfig(createTaxConfigDto: CreateTaxConfigDto, userId: string): Promise<TaxConfig> {
    const newConfig = new this.taxConfigModel({
      ...createTaxConfigDto,
      createdBy: userId,
    });

    const savedConfig = await newConfig.save();

    // Log audit
    await this.auditService.createAuditLog({
      action: 'CREATE',
      userId,
      module: 'TAX_CONFIG',
      description: `Tax config created for ${createTaxConfigDto.countryName}`,
    });

    return savedConfig;
  }

  async getAllShippingConfigs(): Promise<ShippingConfig[]> {
    return this.shippingConfigModel.find().sort({ countryName: 1 }).exec();
  }

  async getAllTaxConfigs(): Promise<TaxConfig[]> {
    return this.taxConfigModel.find().sort({ countryName: 1 }).exec();
  }

  async updateShippingConfig(id: string, updateData: Partial<CreateShippingConfigDto>, userId: string): Promise<ShippingConfig> {
    const config = await this.shippingConfigModel.findById(id);
    
    if (!config) {
      throw new NotFoundException(`Shipping config with ID ${id} not found`);
    }

    Object.assign(config, { ...updateData, updatedBy: userId });
    const updatedConfig = await config.save();

    // Log audit
    await this.auditService.createAuditLog({
      action: 'UPDATE',
      userId,
      module: 'SHIPPING_CONFIG',
      description: `Shipping config updated for ${config.countryName}`,
      changes: JSON.stringify(updateData),
    });

    return updatedConfig;
  }

  async updateTaxConfig(id: string, updateData: Partial<CreateTaxConfigDto>, userId: string): Promise<TaxConfig> {
    const config = await this.taxConfigModel.findById(id);
    
    if (!config) {
      throw new NotFoundException(`Tax config with ID ${id} not found`);
    }

    Object.assign(config, { ...updateData, updatedBy: userId });
    const updatedConfig = await config.save();

    // Log audit
    await this.auditService.createAuditLog({
      action: 'UPDATE',
      userId,
      module: 'TAX_CONFIG',
      description: `Tax config updated for ${config.countryName}`,
      changes: JSON.stringify(updateData),
    });

    return updatedConfig;
  }

  async deleteShippingConfig(id: string, userId: string): Promise<void> {
    const config = await this.shippingConfigModel.findById(id);
    
    if (!config) {
      throw new NotFoundException(`Shipping config with ID ${id} not found`);
    }

    // Don't allow deletion of DEFAULT config
    if (config.countryCode === 'DEFAULT') {
      throw new Error('Cannot delete the default shipping configuration');
    }

    await this.shippingConfigModel.findByIdAndDelete(id);

    // Log audit
    await this.auditService.createAuditLog({
      action: 'DELETE',
      userId,
      module: 'SHIPPING_CONFIG',
      description: `Shipping config deleted for ${config.countryName}`,
    });
  }

  async deleteTaxConfig(id: string, userId: string): Promise<void> {
    const config = await this.taxConfigModel.findById(id);
    
    if (!config) {
      throw new NotFoundException(`Tax config with ID ${id} not found`);
    }

    // Don't allow deletion of DEFAULT config
    if (config.countryCode === 'DEFAULT') {
      throw new Error('Cannot delete the default tax configuration');
    }

    await this.taxConfigModel.findByIdAndDelete(id);

    // Log audit
    await this.auditService.createAuditLog({
      action: 'DELETE',
      userId,
      module: 'TAX_CONFIG',
      description: `Tax config deleted for ${config.countryName}`,
    });
  }

  async createBulkShippingConfigs(
    createShippingConfigDtos: CreateShippingConfigDto[], 
    userId: string
  ): Promise<ShippingConfig[] | any> {
    try {
      // Prepare bulk data with userId
      const bulkData = createShippingConfigDtos.map(dto => ({
        ...dto,
        createdBy: userId,
      }));

      // Bulk insert
      const savedConfigs = await this.shippingConfigModel.insertMany(bulkData);

      // Create bulk audit logs
      const auditLogs = savedConfigs.map(config => ({
        action: 'CREATE',
        userId,
        module: 'SHIPPING_CONFIG',
        description: `Shipping config created for ${config.countryName}`,
      }));

      // // Log all audits at once
      // await this.auditService.createBulkAuditLogs?.(auditLogs) || 
      //       Promise.all(auditLogs.map(log => this.auditService.createAuditLog(log)));

      // return savedConfigs;
    } catch (error) {
      // Log the bulk operation failure
      await this.auditService.createAuditLog({
        action: 'CREATE_BULK',
        userId,
        module: 'SHIPPING_CONFIG',
        description: `Bulk shipping config creation failed: ${error.message}`,
      });
      
      throw error;
    }
  }

  async createBulkTaxConfigs(
    createTaxConfigDtos: CreateTaxConfigDto[], 
    userId: string
  ): Promise<TaxConfig[] | any> {
    try {
      // Prepare bulk data with userId
      const bulkData = createTaxConfigDtos.map(dto => ({
        ...dto,
        createdBy: userId,
      }));

      // Bulk insert
      const savedConfigs = await this.taxConfigModel.insertMany(bulkData);

      // Create bulk audit logs
      const auditLogs = savedConfigs.map(config => ({
        action: 'CREATE',
        userId,
        module: 'TAX_CONFIG',
        description: `Tax config created for ${config.countryName}`,
      }));

      // // Log all audits at once
      // await this.auditService.createBulkAuditLogs?.(auditLogs) || 
      //       Promise.all(auditLogs.map(log => this.auditService.createAuditLog(log)));

      // return savedConfigs;
    } catch (error) {
      // Log the bulk operation failure
      await this.auditService.createAuditLog({
        action: 'CREATE_BULK',
        userId,
        module: 'TAX_CONFIG',
        description: `Bulk tax config creation failed: ${error.message}`,
      });
      
      throw error;
    }
  }
}