// import { Injectable, inject } from '@angular/core';
// import { Observable } from 'rxjs';
// import { ApiService } from './api.service';
// import { ApiResponse } from '../models/api-response.model';
// import { ProfileResponse, UpdateProfileRequest, ChangePasswordRequest } from '../models/profile.model';
// import { Order } from '../models/order.model';

// @Injectable({ providedIn: 'root' })
// export class ProfileService {
//   private api = inject(ApiService);

//   // GET /api/profile
//   getProfile(): Observable<ApiResponse<ProfileResponse>> {
//     return this.api.getSecure<ApiResponse<ProfileResponse>>('profile');
//   }

//   // PUT /api/profile
//   updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<ProfileResponse>> {
//     return this.api.putSecure<ApiResponse<ProfileResponse>>('profile', data);
//   }

//   // PUT /api/profile/change-password
//   changePassword(data: ChangePasswordRequest): Observable<ApiResponse<null>> {
//     return this.api.putSecure<ApiResponse<null>>('profile/change-password', data);
//   }

//   // GET /api/profile/orders
//   getMyOrders(): Observable<ApiResponse<Order[]>> {
//     return this.api.getSecure<ApiResponse<Order[]>>('profile/orders');
//   }

//   // GET /api/profile/orders/{orderId}
//   getOrderDetail(orderId: number): Observable<ApiResponse<Order>> {
//     return this.api.getSecure<ApiResponse<Order>>(`profile/orders/${orderId}`);
//   }

//   // PUT /api/orders/{id}/cancel — technically Orders endpoint hai,
//   // convenience ke liye yahin rakha
//   cancelOrder(orderId: number): Observable<ApiResponse<null>> {
//     return this.api.putSecure<ApiResponse<null>>(`orders/${orderId}/cancel`, {});
//   }
// }

import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private api: ApiService) {}

  // Profile data
  getProfile() {
    return this.api.getSecure<any>('profile');
  }

  // Profile update
  updateProfile(fullName: string) {
    return this.api.putSecure<any>('profile', { fullName });
  }

  // Password change
  changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string) {
    return this.api.putSecure<any>('profile/change-password', {
      currentPassword,
      newPassword,
      confirmNewPassword
    });
  }

  // My orders
  getMyOrders() {
    return this.api.getSecure<any>('profile/orders');
  }

  // Single order detail
  getOrderDetail(orderId: number) {
    return this.api.getSecure<any>(`profile/orders/${orderId}`);
  }

  // Order cancel karo
cancelOrder(orderId: number) {
  return this.api.putSecure<any>(`orders/${orderId}/cancel`, {});
}
}