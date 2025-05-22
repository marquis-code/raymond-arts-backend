// src/common/types/mongoose-types.ts
import mongoose from 'mongoose';

// This type allows both string and both types of ObjectId
export type ObjectIdType = 
  | string 
  | mongoose.Types.ObjectId 
  | mongoose.Schema.Types.ObjectId;

// This function converts to the Schema.Types.ObjectId type
export function toSchemaObjectId(id: ObjectIdType): mongoose.Schema.Types.ObjectId {
  if (typeof id === 'string') {
    return new mongoose.Types.ObjectId(id) as unknown as mongoose.Schema.Types.ObjectId;
  }
  // Force cast the ObjectId to Schema.Types.ObjectId
  return id as unknown as mongoose.Schema.Types.ObjectId;
}