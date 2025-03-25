import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ContactsService } from "./contacts.service"
import { ContactsController } from "./contacts.controller"
import { Contact, ContactSchema } from "./schemas/contact.schema"
import { AuditModule } from "../audit/audit.module"

@Module({
  imports: [MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]), AuditModule],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}

