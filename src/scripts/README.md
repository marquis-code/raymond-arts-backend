# Installment Configuration Setup Script

This script allows you to batch setup installment payment configurations for all products in your NestJS application.

## Features

- **Automatic Configuration**: Sets up installment configs based on product price ranges
- **Flexible Rules**: Different installment terms and interest rates for different price tiers
- **Batch Processing**: Handles large product catalogs efficiently with pagination
- **Error Handling**: Robust error handling with detailed logging
- **Multiple Commands**: Setup, disable, or configure specific products

## Price-Based Configuration Rules

### Budget Products ($0 - $100)
- **Terms**: 3, 6 months
- **Max Installments**: 6
- **Interest Rate**: 2.5%
- **Minimum Amount**: $50

### Mid-Range Products ($100 - $500)
- **Terms**: 3, 6, 12 months
- **Max Installments**: 12
- **Interest Rate**: 5.0%
- **Minimum Amount**: $100

### Premium Products ($500 - $1,500)
- **Terms**: 6, 12, 18, 24 months
- **Max Installments**: 24
- **Interest Rate**: 8.5%
- **Minimum Amount**: $500

### Luxury Products ($1,500+)
- **Terms**: 12, 18, 24, 36 months
- **Max Installments**: 36
- **Interest Rate**: 12.0%
- **Minimum Amount**: $1,500

## Usage with Yarn

### Setup All Products
```bash
yarn script:installment setup
```

### Setup Specific Products
```bash
yarn script:installment setup-specific 60d21b4667d0d8992e610c85 60d21b4667d0d8992e610c86
```

### Disable All Installment Configurations
```bash
yarn script:installment disable
```

### Show Help
```bash
yarn script:installment
```

## Configuration Structure

Each product will receive an `installmentConfig` object with the following structure:

```typescript
{
  enabled: boolean;
  minimumAmount: number;
  maxInstallments: number;
  availableTerms: number[];
  interestRate: number;
}
```

## Logging

The script provides detailed logging including:
- Progress updates during batch processing
- Success/failure status for each product
- Final summary with statistics
- Error details for troubleshooting

## Error Handling

- Continues processing even if individual products fail
- Logs detailed error information
- Provides summary of successes and failures
- Graceful handling of database connection issues

## Customization

You can modify the price ranges and configuration rules by editing the `getInstallmentRules()` method in the script. This allows you to:

- Adjust price thresholds
- Modify interest rates
- Change available payment terms
- Update minimum amount requirements

## Prerequisites

Make sure your NestJS application has:
- ProductsService properly configured
- Database connection established
- Required dependencies installed (`ts-node`, `tsconfig-paths`)

## Safety Features

- **Pagination**: Processes products in batches to avoid memory issues
- **Rate Limiting**: Includes delays between operations to prevent database overload
- **Rollback Support**: The disable command can revert all changes if needed
- **Detailed Logging**: Track exactly what changes are made to each product