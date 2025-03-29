import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Helper type for converting string IDs to ObjectId
type ObjectIdType = string | mongoose.Types.ObjectId;

// Extend mongoose Document to include _id as string for easier use
declare module 'mongoose' {
  interface Document {
    _id: mongoose.Types.ObjectId;
  }
}