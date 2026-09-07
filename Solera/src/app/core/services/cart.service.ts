import { Injectable, signal, computed } from '@angular/core';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Cart } from '../models/cart.model';
import { Order } from '../models/order.model';

export interface CheckoutData {
  deliveryAddress: string;
  phoneNumber: string;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private _cart = signal<Cart | null>(null);

  readonly cart = this._cart.asReadonly();

  readonly totalItems = computed(() =>
    this._cart()?.totalItems ?? 0
  );

  readonly totalAmount = computed(() =>
    this._cart()?.totalAmount ?? 0
  );

  constructor(private api: ApiService) {}

  loadCart() {
    return this.api.getSecure<ApiResponse<Cart>>('cart').pipe(
      tap(response => {
        if (response.success) {
          this._cart.set(response.data);
        }
      })
    );
  }

  addToCart(productId: number, quantity: number = 1, selectedColor = '', selectedSize = '') {
    return this.api.postSecure<ApiResponse<Cart>>('cart/add', {
      productId,
      quantity,
      selectedColor,
      selectedSize
    }).pipe(
      tap(response => {
        if (response.success) {
          this._cart.set(response.data);
        }
      })
    );
  }

  updateQuantity(cartItemId: number, quantity: number) {
    return this.api.putSecure<ApiResponse<Cart>>(
      `cart/items/${cartItemId}`,
      { quantity }
    ).pipe(
      tap(response => {
        if (response.success) {
          this._cart.set(response.data);
        }
      })
    );
  }

  removeItem(cartItemId: number) {
    return this.api.deleteSecure<ApiResponse<Cart>>(
      `cart/items/${cartItemId}`
    ).pipe(
      tap(response => {
        if (response.success) {
          this._cart.set(response.data);
        }
      })
    );
  }

  clearCart() {
    return this.api.deleteSecure<ApiResponse<any>>('cart/clear').pipe(
      tap(() => this._cart.set(null))
    );
  }

  checkout(data: CheckoutData) {
    return this.api.postSecure<ApiResponse<any>>('cart/checkout', {
      deliveryAddress: data.deliveryAddress,
      phoneNumber: data.phoneNumber,
      latitude: data.latitude,
      longitude: data.longitude,
      locationAddress: data.locationAddress
    }).pipe(
      tap(response => {
        if (response.success) {
          this._cart.set(null);
        }
      })
    );
  }
}
