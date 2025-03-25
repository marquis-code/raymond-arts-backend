import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ProductsService } from "./products.service"
import { ProductsController } from "./products.controller"
import { Product, ProductSchema } from "./schemas/product.schema"
import { Category, CategorySchema } from "./schemas/category.schema"
import { CloudinaryModule } from "../cloudinary/cloudinary.module"
import { AuditModule } from "../audit/audit.module"
import { InventoryModule } from "../inventory/inventory.module"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    CloudinaryModule,
    AuditModule,
    InventoryModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

