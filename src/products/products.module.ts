


import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ProductsService } from "./products.service"
import { ProductsController } from "./products.controller"
import { Product, ProductSchema } from "./schemas/product.schema"
import { Category, CategorySchema } from "./schemas/category.schema"
import { CloudinaryUtilityModule } from "../common/modules/cloudinary-utility.module"
import { AuditUtilityModule } from "../common/modules/audit-utility.module"
import { InventoryModule } from "../inventory/inventory.module"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    CloudinaryUtilityModule,
    AuditUtilityModule,
    InventoryModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

