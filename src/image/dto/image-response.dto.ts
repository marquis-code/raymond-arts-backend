export class ImageResponseDto {
  id?: string;
  filename: string;
  originalName: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  folder: string;
  resourceType: string;
  tags: string[];
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export class PaginatedImagesResponseDto {
  images: any[]; // Changed from ImageResponseDto[] to any[]
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}