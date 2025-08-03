import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { OriginalsService } from "./originals.service"
import { OriginalsController } from "./originals.controller"
import { Originals, OriginalsSchema } from "./schemas/original.schema"

@Module({
  imports: [MongooseModule.forFeature([{ name: Originals.name, schema: OriginalsSchema }])],
  controllers: [OriginalsController],
  providers: [OriginalsService],
})
export class OriginalsModule {}
