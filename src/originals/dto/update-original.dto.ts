import { PartialType } from "@nestjs/mapped-types"
import { CreateOriginalDto } from "./create-original.dto"

export class UpdateOriginalDto extends PartialType(CreateOriginalDto) {}
