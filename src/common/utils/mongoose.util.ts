// import { Types } from 'mongoose';

// export const toObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
//   return typeof id === 'string' ? new Types.ObjectId(id) : id;
// };
import type { DynamicModule, ForwardReference, Type } from "@nestjs/common"

/**
 * Utility function to create a module that can be used to break circular dependencies
 * @param imports Array of modules to import
 * @returns Dynamic module
 */
export function createUtilityModule(imports: Array<Type<any> | DynamicModule | ForwardReference>): DynamicModule {
  return {
    module: class UtilityModule {},
    imports,
    exports: imports,
  }
}

