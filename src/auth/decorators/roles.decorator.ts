import { SetMetadata } from "@nestjs/common"
import type { UserRole } from "../../users/enums/user-role.enum"

export const Roles = (...roles: UserRole[]) => SetMetadata("roles", roles)

