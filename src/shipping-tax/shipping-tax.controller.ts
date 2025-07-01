import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Request, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ShippingTaxService } from './shipping-tax.service';
import { CreateShippingConfigDto } from './dto/create-shipping-config.dto';
import { CreateTaxConfigDto } from './dto/create-tax-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';


// DTOs for bulk operations
class CreateBulkShippingConfigDto {
  configs: CreateShippingConfigDto[];
}

class CreateBulkTaxConfigDto {
  configs: CreateTaxConfigDto[];
}

class BulkCreateResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  totalCreated: number;
  errors?: string[];
}


@ApiTags('Shipping & Tax')
@Controller('shipping-tax')
export class ShippingTaxController {
  constructor(private readonly shippingTaxService: ShippingTaxService) {}

  @Post('shipping')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create shipping configuration' })
  createShippingConfig(@Body() createShippingConfigDto: CreateShippingConfigDto, @Req() req) {
    return this.shippingTaxService.createShippingConfig(createShippingConfigDto, req.user.id);
  }

  @Post('tax')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create tax configuration' })
  createTaxConfig(@Body() createTaxConfigDto: CreateTaxConfigDto, @Req() req) {
    return this.shippingTaxService.createTaxConfig(createTaxConfigDto, req.user.id);
  }

  @Get('shipping')
  @ApiOperation({ summary: 'Get all shipping configurations' })
  getAllShippingConfigs() {
    return this.shippingTaxService.getAllShippingConfigs();
  }

  @Get('tax')
  @ApiOperation({ summary: 'Get all tax configurations' })
  getAllTaxConfigs() {
    return this.shippingTaxService.getAllTaxConfigs();
  }

  @Post('shipping-configs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async createBulkShippingConfigs(
    @Body() createBulkShippingConfigDto: CreateBulkShippingConfigDto,
    @Request() req: any
  ): Promise<BulkCreateResponse<any>> {
    console.log(req.user.sub, 'req')
    try {
      // Validation
      if (!createBulkShippingConfigDto.configs || !Array.isArray(createBulkShippingConfigDto.configs)) {
        throw new BadRequestException('configs must be a non-empty array');
      }

      if (createBulkShippingConfigDto?.configs?.length === 0) {
        throw new BadRequestException('At least one shipping configuration is required');
      }

      if (createBulkShippingConfigDto?.configs?.length > 100) {
        throw new BadRequestException('Maximum 100 configurations allowed per bulk operation');
      }

      // Validate each config
      const duplicateCountryCodes = this.findDuplicateCountryCodes(
        createBulkShippingConfigDto.configs.map(c => c.countryCode)
      );
      
      if (duplicateCountryCodes?.length > 0) {
        throw new BadRequestException(
          `Duplicate country codes found: ${duplicateCountryCodes.join(', ')}`
        );
      }

      const userId = req.user.sub; // Adjust based on your JWT payload structure

      // Create bulk configurations
      const createdConfigs = await this.shippingTaxService.createBulkShippingConfigs(
        createBulkShippingConfigDto.configs,
        userId
      );

      return {
        success: true,
        message: `Successfully created ${createdConfigs?.length} shipping configurations`,
        data: createdConfigs,
        totalCreated: createdConfigs?.length
      };

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to create bulk shipping configurations',
        error: error.message
      });
    }
  }

  @Post('tax-configs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async createBulkTaxConfigs(
    @Body() createBulkTaxConfigDto: CreateBulkTaxConfigDto,
    @Request() req: any
  ): Promise<BulkCreateResponse<any>> {
    try {
      // Validation
      if (!createBulkTaxConfigDto.configs || !Array.isArray(createBulkTaxConfigDto.configs)) {
        throw new BadRequestException('configs must be a non-empty array');
      }

      if (createBulkTaxConfigDto.configs.length === 0) {
        throw new BadRequestException('At least one tax configuration is required');
      }

      // if (createBulkTaxConfigDto.configs.length > 100) {
      //   throw new BadRequestException('Maximum 100 configurations allowed per bulk operation');
      // }

      // Validate each config
      const duplicateCountryCodes = this.findDuplicateCountryCodes(
        createBulkTaxConfigDto.configs.map(c => c.countryCode)
      );
      
      if (duplicateCountryCodes.length > 0) {
        throw new BadRequestException(
          `Duplicate country codes found: ${duplicateCountryCodes.join(', ')}`
        );
      }

      const userId = req.user.sub; // Adjust based on your JWT payload structure

      // Create bulk configurations
      const createdConfigs = await this.shippingTaxService.createBulkTaxConfigs(
        createBulkTaxConfigDto.configs,
        userId
      );

      return {
        success: true,
        message: `Successfully created ${createdConfigs?.length} tax configurations`,
        data: createdConfigs,
        totalCreated: createdConfigs?.length
      };

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to create bulk tax configurations',
        error: error.message
      });
    }
  }


  @Patch('shipping/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shipping configuration' })
  updateShippingConfig(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateShippingConfigDto>,
    @Req() req,
  ) {
    return this.shippingTaxService.updateShippingConfig(id, updateData, req.user.id);
  }

  @Patch('tax/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tax configuration' })
  updateTaxConfig(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateTaxConfigDto>,
    @Req() req,
  ) {
    return this.shippingTaxService.updateTaxConfig(id, updateData, req.user.id);
  }

  @Delete('shipping/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete shipping configuration' })
  deleteShippingConfig(@Param('id') id: string, @Req() req) {
    return this.shippingTaxService.deleteShippingConfig(id, req.user.id);
  }

  @Delete('tax/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete tax configuration' })
  deleteTaxConfig(@Param('id') id: string, @Req() req) {
    return this.shippingTaxService.deleteTaxConfig(id, req.user.id);
  }

    // Helper method to find duplicate country codes
    private findDuplicateCountryCodes(countryCodes: string[]): string[] {
      const seen = new Set<string>();
      const duplicates = new Set<string>();
      
      for (const code of countryCodes) {
        if (seen.has(code)) {
          duplicates.add(code);
        } else {
          seen.add(code);
        }
      }
      
      return Array.from(duplicates);
    }
}

// import { 
//   Controller, 
//   Post, 
//   Body, 
//   HttpStatus, 
//   HttpCode, 
//   UseGuards, 
//   Request,
//   BadRequestException,
//   InternalServerErrorException
// } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
// import { ShippingTaxService } from './shipping-tax.service';
// import { CreateShippingConfigDto } from './dto/create-shipping-config.dto';
// import { CreateTaxConfigDto } from './dto/create-tax-config.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Adjust import path as needed
// import { RolesGuard } from '../auth/guards/roles.guard'; // Adjust import path as needed
// import { Roles } from '../auth/decorators/roles.decorator'; // Adjust import path as needed

// // DTOs for bulk operations
// class CreateBulkShippingConfigDto {
//   configs: CreateShippingConfigDto[];
// }

// class CreateBulkTaxConfigDto {
//   configs: CreateTaxConfigDto[];
// }

// class BulkCreateResponse<T> {
//   success: boolean;
//   message: string;
//   data: T[];
//   totalCreated: number;
//   errors?: string[];
// }

// @ApiTags('Shipping & Tax Configuration - Bulk Operations')
// @Controller('shipping-tax/bulk')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @ApiBearerAuth()
// export class BulkShippingTaxController {
//   constructor(private readonly shippingTaxService: ShippingTaxService) {}

//   @Post('shipping-configs')
//   @HttpCode(HttpStatus.CREATED)
//   @Roles('admin', 'super-admin') // Adjust roles as needed
//   @ApiOperation({ 
//     summary: 'Create multiple shipping configurations',
//     description: 'Create shipping configurations for multiple countries in bulk'
//   })
//   @ApiBody({
//     description: 'Array of shipping configuration objects',
//     type: CreateBulkShippingConfigDto,
//     examples: {
//       example1: {
//         summary: 'Multiple Countries Example',
//         value: {
//           configs: [
//             {
//               countryCode: 'CA',
//               countryName: 'Canada',
//               shippingRate: 45,
//               isActive: true
//             },
//             {
//               countryCode: 'UK',
//               countryName: 'United Kingdom',
//               shippingRate: 55,
//               isActive: true
//             },
//             {
//               countryCode: 'DE',
//               countryName: 'Germany',
//               shippingRate: 50,
//               isActive: true
//             }
//           ]
//         }
//       }
//     }
//   })
//   @ApiResponse({
//     status: 201,
//     description: 'Shipping configurations created successfully',
//     schema: {
//       type: 'object',
//       properties: {
//         success: { type: 'boolean' },
//         message: { type: 'string' },
//         data: { type: 'array' },
//         totalCreated: { type: 'number' }
//       }
//     }
//   })
//   @ApiResponse({ status: 400, description: 'Invalid input data' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
//   @ApiResponse({ status: 500, description: 'Internal server error' })
//   async createBulkShippingConfigs(
//     @Body() createBulkShippingConfigDto: CreateBulkShippingConfigDto,
//     @Request() req: any
//   ): Promise<BulkCreateResponse<any>> {
//     try {
//       // Validation
//       if (!createBulkShippingConfigDto.configs || !Array.isArray(createBulkShippingConfigDto.configs)) {
//         throw new BadRequestException('configs must be a non-empty array');
//       }

//       if (createBulkShippingConfigDto.configs.length === 0) {
//         throw new BadRequestException('At least one shipping configuration is required');
//       }

//       if (createBulkShippingConfigDto.configs.length > 100) {
//         throw new BadRequestException('Maximum 100 configurations allowed per bulk operation');
//       }

//       // Validate each config
//       const duplicateCountryCodes = this.findDuplicateCountryCodes(
//         createBulkShippingConfigDto.configs.map(c => c.countryCode)
//       );
      
//       if (duplicateCountryCodes.length > 0) {
//         throw new BadRequestException(
//           `Duplicate country codes found: ${duplicateCountryCodes.join(', ')}`
//         );
//       }

//       const userId = req.user.id || req.user.userId; // Adjust based on your JWT payload structure

//       // Create bulk configurations
//       const createdConfigs = await this.shippingTaxService.createBulkShippingConfigs(
//         createBulkShippingConfigDto.configs,
//         userId
//       );

//       return {
//         success: true,
//         message: `Successfully created ${createdConfigs.length} shipping configurations`,
//         data: createdConfigs,
//         totalCreated: createdConfigs.length
//       };

//     } catch (error) {
//       if (error instanceof BadRequestException) {
//         throw error;
//       }
      
//       throw new InternalServerErrorException({
//         success: false,
//         message: 'Failed to create bulk shipping configurations',
//         error: error.message
//       });
//     }
//   }


//   @Post('tax-configs')
//   @HttpCode(HttpStatus.CREATED)
//   @Roles('admin', 'super-admin') // Adjust roles as needed
//   @ApiOperation({ 
//     summary: 'Create multiple tax configurations',
//     description: 'Create tax configurations for multiple countries in bulk'
//   })
//   @ApiBody({
//     description: 'Array of tax configuration objects',
//     type: CreateBulkTaxConfigDto,
//     examples: {
//       example1: {
//         summary: 'Multiple Countries Example',
//         value: {
//           configs: [
//             {
//               countryCode: 'CA',
//               countryName: 'Canada',
//               vatRate: 5.0,
//               isActive: true
//             },
//             {
//               countryCode: 'UK',
//               countryName: 'United Kingdom',
//               vatRate: 20.0,
//               isActive: true
//             },
//             {
//               countryCode: 'DE',
//               countryName: 'Germany',
//               vatRate: 19.0,
//               isActive: true
//             }
//           ]
//         }
//       }
//     }
//   })
//   @ApiResponse({
//     status: 201,
//     description: 'Tax configurations created successfully',
//     schema: {
//       type: 'object',
//       properties: {
//         success: { type: 'boolean' },
//         message: { type: 'string' },
//         data: { type: 'array' },
//         totalCreated: { type: 'number' }
//       }
//     }
//   })
//   @ApiResponse({ status: 400, description: 'Invalid input data' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
//   @ApiResponse({ status: 500, description: 'Internal server error' })
//   async createBulkTaxConfigs(
//     @Body() createBulkTaxConfigDto: CreateBulkTaxConfigDto,
//     @Request() req: any
//   ): Promise<BulkCreateResponse<any>> {
//     try {
//       // Validation
//       if (!createBulkTaxConfigDto.configs || !Array.isArray(createBulkTaxConfigDto.configs)) {
//         throw new BadRequestException('configs must be a non-empty array');
//       }

//       if (createBulkTaxConfigDto.configs.length === 0) {
//         throw new BadRequestException('At least one tax configuration is required');
//       }

//       if (createBulkTaxConfigDto.configs.length > 100) {
//         throw new BadRequestException('Maximum 100 configurations allowed per bulk operation');
//       }

//       // Validate each config
//       const duplicateCountryCodes = this.findDuplicateCountryCodes(
//         createBulkTaxConfigDto.configs.map(c => c.countryCode)
//       );
      
//       if (duplicateCountryCodes.length > 0) {
//         throw new BadRequestException(
//           `Duplicate country codes found: ${duplicateCountryCodes.join(', ')}`
//         );
//       }

//       const userId = req.user.id || req.user.userId; // Adjust based on your JWT payload structure

//       // Create bulk configurations
//       const createdConfigs = await this.shippingTaxService.createBulkTaxConfigs(
//         createBulkTaxConfigDto.configs,
//         userId
//       );

//       return {
//         success: true,
//         message: `Successfully created ${createdConfigs.length} tax configurations`,
//         data: createdConfigs,
//         totalCreated: createdConfigs.length
//       };

//     } catch (error) {
//       if (error instanceof BadRequestException) {
//         throw error;
//       }
      
//       throw new InternalServerErrorException({
//         success: false,
//         message: 'Failed to create bulk tax configurations',
//         error: error.message
//       });
//     }
//   }
// }