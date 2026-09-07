export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
  categoryId: number;
  createdAt: string;
  discountPercentage?: number;
  discountAmount?: number;
  hasDiscount?: boolean;
  finalPrice?: number;
  galleryImages?: string[] | string;
  availableColors?: string[] | string;
  availableSizes?: string[] | string;
}
