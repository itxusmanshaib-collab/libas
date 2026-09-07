export interface AuthResponse {
  token: string;
  fullName: string;
  email: string;
  role: string;
  expiresAt: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}