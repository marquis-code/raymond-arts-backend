import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ContactsService } from "./contacts.service"
import { ContactsController } from "./contacts.controller"
import { Contact, ContactSchema } from "./schemas/contact.schema"
import { AuditUtilityModule } from "../common/modules/audit-utility.module"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]),
    AuditUtilityModule, // Use the utility module instead of AuditModule
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}

