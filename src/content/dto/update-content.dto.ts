import { PartialType, OmitType } from "@nestjs/swagger"
import { CreateContentDto } from "./create-content.dto"

export class UpdateContentDto extends PartialType(OmitType(CreateContentDto, ["type"] as const)) {}
