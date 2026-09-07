export interface ProfileResponse {
  id: number;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

export interface UpdateProfileRequest {
  fullName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}