import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ProductsService } from '../products/products.service';
import { Logger } from '@nestjs/common';
import { Types } from 'mongoose';

interface InstallmentConfig {
  enabled: boolean;
  minimumAmount: number;
  maxInstallments: number;
  availableTerms: number[];
  interestRate: number;
}

interface ProductInstallmentRule {
  priceRange: {
    min: number;
    max: number;
  };
  config: InstallmentConfig;
}

class InstallmentConfigurationService {
  private readonly logger = new Logger(InstallmentConfigurationService.name);
  private readonly systemUserId: string;

  constructor(private readonly productsService: ProductsService) {
    // Create a consistent system user ObjectId for audit logging
    this.systemUserId = new Types.ObjectId().toString();
    this.logger.log(`🔧 Using system user ID: ${this.systemUserId}`);
  }

  // Define installment rules based on product price ranges
  private getInstallmentRules(): ProductInstallmentRule[] {
    return [
      // Budget products ($0 - $100) - Basic installment options
      {
        priceRange: { min: 0, max: 100 },
        config: {
          enabled: true,
          minimumAmount: 50,
          maxInstallments: 6,
          availableTerms: [3, 6],
          interestRate: 2.5
        }
      },
      // Mid-range products ($100 - $500) - Standard installment options
      {
        priceRange: { min: 100, max: 500 },
        config: {
          enabled: true,
          minimumAmount: 100,
          maxInstallments: 12,
          availableTerms: [3, 6, 12],
          interestRate: 5.0
        }
      },
      // Premium products ($500 - $1500) - Extended installment options
      {
        priceRange: { min: 500, max: 1500 },
        config: {
          enabled: true,
          minimumAmount: 500,
          maxInstallments: 24,
          availableTerms: [6, 12, 18, 24],
          interestRate: 8.5
        }
      },
      // Luxury products ($1500+) - Premium installment options
      {
        priceRange: { min: 1500, max: Infinity },
        config: {
          enabled: true,
          minimumAmount: 1500,
          maxInstallments: 36,
          availableTerms: [12, 18, 24, 36],
          interestRate: 12.0
        }
      }
    ];
  }

  // Get installment config based on product price
  private getConfigForPrice(price: number): InstallmentConfig {
    const rules = this.getInstallmentRules();
    
    for (const rule of rules) {
      if (price >= rule.priceRange.min && price < rule.priceRange.max) {
        return rule.config;
      }
    }
    
    // Default fallback config
    return {
      enabled: false,
      minimumAmount: 0,
      maxInstallments: 0,
      availableTerms: [],
      interestRate: 0
    };
  }

  // Setup installment configuration for a single product
  private async setupProductInstallmentConfig(product: any): Promise<boolean> {
    try {
      const price = product.discountPrice > 0 ? product.discountPrice : product.price;
      const config = this.getConfigForPrice(price);

      // Skip if installments should not be enabled for this price range
      if (!config.enabled) {
        this.logger.log(`⏭️  Skipping product ${product.name} (${product._id}) - price $${price} below minimum threshold`);
        return false;
      }

      // Update product with installment configuration
      const updateData = {
        installmentConfig: config,
        // Also update sizes if they exist
        ...(product.sizes && product.sizes.length > 0 && {
          sizes: product.sizes.map((size: any) => ({
            ...size,
            installmentConfig: {
              ...config,
              // Adjust minimum amount based on size-specific pricing if needed
              minimumAmount: Math.max(config.minimumAmount, size.price * 0.5)
            }
          }))
        })
      };

      // Use the system user ID for audit logging
      await this.productsService.updateProduct(product._id.toString(), updateData, this.systemUserId);
      
      this.logger.log(`✅ Updated installment config for product: ${product.name} (${product._id}) - Price: $${price}`);
      this.logger.log(`   📋 Config: enabled=${config.enabled}, minAmount=$${config.minimumAmount}, maxInstallments=${config.maxInstallments}, rate=${config.interestRate}%`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to update product ${product.name} (${product._id}):`, error.message);
      return false;
    }
  }

  // Main method to setup installment configuration for all products
  async setupInstallmentConfigForAllProducts(): Promise<void> {
    this.logger.log('🚀 Starting batch installment configuration setup...');
    
    try {
      // Get all products with pagination
      let page = 1;
      const limit = 50;
      let hasMore = true;
      let totalProcessed = 0;
      let totalUpdated = 0;
      let totalSkipped = 0;
      let totalErrors = 0;

      while (hasMore) {
        this.logger.log(`📄 Processing page ${page}...`);
        
        const result = await this.productsService.findAllProducts({
          page,
          limit,
          sort: 'createdAt',
          order: 'asc'
        });

        const products = result.data;
        
        if (!products || products.length === 0) {
          hasMore = false;
          break;
        }

        // Process each product in the current page
        for (const product of products) {
          totalProcessed++;
          
          try {
            const updated = await this.setupProductInstallmentConfig(product);
            if (updated) {
              totalUpdated++;
            } else {
              totalSkipped++;
            }
          } catch (error) {
            totalErrors++;
            this.logger.error(`💥 Error processing product ${product._id}:`, error.message);
          }
        }

        // Check if we have more pages
        hasMore = products.length === limit && page < result.meta.totalPages;
        page++;

        // Add a small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Final summary
      this.logger.log('🎉 Batch installment configuration setup completed!');
      this.logger.log(`📊 Summary:`);
      this.logger.log(`   • Total products processed: ${totalProcessed}`);
      this.logger.log(`   • Products updated: ${totalUpdated}`);
      this.logger.log(`   • Products skipped: ${totalSkipped}`);
      this.logger.log(`   • Errors encountered: ${totalErrors}`);

      if (totalErrors > 0) {
        this.logger.warn(`⚠️  ${totalErrors} products failed to update. Check the logs above for details.`);
      }

    } catch (error) {
      this.logger.error('💥 Fatal error during batch setup:', error.message);
      throw error;
    }
  }

  // Method to update specific products by IDs
  async setupInstallmentConfigForSpecificProducts(productIds: string[]): Promise<void> {
    this.logger.log(`🎯 Setting up installment config for ${productIds.length} specific products...`);
    
    let updated = 0;
    let errors = 0;

    for (const productId of productIds) {
      try {
        const product = await this.productsService.findProductById(productId);
        const wasUpdated = await this.setupProductInstallmentConfig(product);
        if (wasUpdated) updated++;
      } catch (error) {
        errors++;
        this.logger.error(`❌ Failed to update product ${productId}:`, error.message);
      }
    }

    this.logger.log(`✅ Completed specific product updates: ${updated} updated, ${errors} errors`);
  }

  // Method to disable installment for all products
  async disableInstallmentForAllProducts(): Promise<void> {
    this.logger.log('🚫 Disabling installment configuration for all products...');
    
    try {
      let page = 1;
      const limit = 50;
      let hasMore = true;
      let totalProcessed = 0;
      let totalErrors = 0;

      while (hasMore) {
        const result = await this.productsService.findAllProducts({
          page,
          limit,
          sort: 'createdAt',
          order: 'asc'
        });

        const products = result.data;
        
        if (!products || products.length === 0) {
          hasMore = false;
          break;
        }

        for (const product of products) {
          try {
            await this.productsService.updateProduct(product._id.toString(), {
              installmentConfig: {
                enabled: false,
                minimumAmount: 0,
                maxInstallments: 0,
                availableTerms: [],
                interestRate: 0
              }
            }, this.systemUserId);
            totalProcessed++;
            this.logger.log(`✅ Disabled installment for: ${product.name}`);
          } catch (error) {
            totalErrors++;
            this.logger.error(`❌ Failed to disable installment for product ${product._id}:`, error.message);
          }
        }

        hasMore = products.length === limit && page < result.meta.totalPages;
        page++;

        // Add delay between pages
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.logger.log(`✅ Disabled installment configuration for ${totalProcessed} products`);
      if (totalErrors > 0) {
        this.logger.warn(`⚠️  ${totalErrors} products failed to update.`);
      }
    } catch (error) {
      this.logger.error('💥 Error disabling installment configurations:', error.message);
      throw error;
    }
  }
}

// Main script execution function
async function runInstallmentSetupScript() {
  const logger = new Logger('InstallmentSetupScript');
  
  try {
    logger.log('🔧 Initializing NestJS application...');
    
    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // Get required services
    const productsService = app.get(ProductsService);
    const configService = new InstallmentConfigurationService(productsService);
    
    // Get command line arguments
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'setup':
        await configService.setupInstallmentConfigForAllProducts();
        break;
        
      case 'setup-specific':
        const productIds = args.slice(1);
        if (productIds.length === 0) {
          logger.error('❌ Please provide product IDs: yarn script:installment setup-specific <id1> <id2> ...');
          process.exit(1);
        }
        await configService.setupInstallmentConfigForSpecificProducts(productIds);
        break;
        
      case 'disable':
        await configService.disableInstallmentForAllProducts();
        break;
        
      default:
        logger.log('📖 Available commands:');
        logger.log('  • setup                    - Setup installment config for all products');
        logger.log('  • setup-specific <ids...>  - Setup installment config for specific products');
        logger.log('  • disable                  - Disable installment config for all products');
        logger.log('');
        logger.log('📝 Usage examples:');
        logger.log('  yarn script:installment setup');
        logger.log('  yarn script:installment setup-specific 60d21b4667d0d8992e610c85 60d21b4667d0d8992e610c86');
        logger.log('  yarn script:installment disable');
        break;
    }
    
    // Close the application context
    await app.close();
    logger.log('✅ Script execution completed successfully');
    process.exit(0);
    
  } catch (error) {
    logger.error('💥 Script execution failed:', error.message);
    logger.error(error.stack);
    process.exit(1);
  }
}

// Execute the script if this file is run directly
if (require.main === module) {
  runInstallmentSetupScript();
}

export { InstallmentConfigurationService, runInstallmentSetupScript };