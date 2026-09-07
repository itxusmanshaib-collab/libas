import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';

// Filter options
export interface ProductFilters {
  categoryId?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'featured' | 'price_asc' | 'price_desc' | 'newest';
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private api: ApiService) {}

  // Sab products
  getAllProducts() {
    return this.api.get<ApiResponse<Product[]>>('products');
  }

  // Category ke products
  getByCategory(categoryId: number) {
    return this.api.get<ApiResponse<Product[]>>(
      `products/category/${categoryId}`
    );
  }

  // Search
  searchProducts(keyword: string) {
    return this.api.get<ApiResponse<Product[]>>(
      `products/search?keyword=${keyword}`
    );
  }

  // Single product
  getProductById(id: number) {
    return this.api.get<ApiResponse<Product>>(
      `products/${id}`
    );
  }

  // Categories
  getCategories() {
    return this.api.get<ApiResponse<Category[]>>('categories');
  }

  // Product reviews
  getProductReviews(productId: number) {
    return this.api.get<ApiResponse<any>>(
      `reviews/product/${productId}`
    );
  }
}