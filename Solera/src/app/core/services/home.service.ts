import { Injectable } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';

export interface Banner {
  id: number;
  title: string;
  subTitle: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  displayOrder: number;
  isActive: boolean;
}

export interface SiteNotification {
  id: number;
  message: string;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
}

export interface Testimonial {
  id: number;
  customerName: string;
  customerRole: string;
  content: string;
  rating: number;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
}

export interface WhyChooseUsItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private api: ApiService) {}

  getBanners() {
    return this.api.get<ApiResponse<Banner[]>>('banners');
  }

  getCategories() {
    return this.api.get<ApiResponse<Category[]>>('categories');
  }

  getFeaturedProducts() {
    return this.api.get<ApiResponse<Product[]>>('products');
  }

  getActiveNotification() {
    return this.api.get<ApiResponse<SiteNotification>>('notifications/active');
  }

  getTestimonials() {
    return this.api.get<ApiResponse<Testimonial[]>>('testimonials');
  }

  getWhyChooseUs() {
    return this.api.get<ApiResponse<WhyChooseUsItem[]>>('whychooseus');
  }

  loadHomeData() {
    return forkJoin({
      banners: this.getBanners().pipe(
        catchError(err => {
          console.error('Failed to load banners', err);
          return of({ success: false, data: [] as Banner[], message: '', statusCode: 0, errors: [] });
        })
      ),
      categories: this.getCategories().pipe(
        catchError(err => {
          console.error('Failed to load categories', err);
          return of({ success: false, data: [] as Category[], message: '', statusCode: 0, errors: [] });
        })
      ),
      products: this.getFeaturedProducts().pipe(
        catchError(err => {
          console.error('Failed to load products', err);
          return of({ success: false, data: [] as Product[], message: '', statusCode: 0, errors: [] });
        })
      ),
      notification: this.getActiveNotification().pipe(
        catchError(err => {
          console.error('Failed to load notification', err);
          return of({ success: false, data: null as SiteNotification | null, message: '', statusCode: 0, errors: [] });
        })
      ),
      testimonials: this.getTestimonials().pipe(
        catchError(err => {
          console.error('Failed to load testimonials', err);
          return of({ success: false, data: [] as Testimonial[], message: '', statusCode: 0, errors: [] });
        })
      ),
      whyChooseUs: this.getWhyChooseUs().pipe(
        catchError(err => {
          console.error('Failed to load why choose us', err);
          return of({ success: false, data: [] as WhyChooseUsItem[], message: '', statusCode: 0, errors: [] });
        })
      ),
    });
  }
}
