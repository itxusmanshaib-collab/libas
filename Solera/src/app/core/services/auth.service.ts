import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { AuthResponse, User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // ── Signals — reactive state ──
  // Angular 21 mein signals use karte hain
  // Component mein automatically update hota hai

  // Current user — null matlab logged out
  private _currentUser = signal<AuthResponse | null>(null);

  // Public computed values — components mein use karo
  readonly currentUser = this._currentUser.asReadonly();

  // Logged in hai ya nahi
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  // User ka role — "User" ya "Admin"
  readonly userRole = computed(() => this._currentUser()?.role ?? '');

  // Admin hai ya nahi
  readonly isAdmin = computed(() => this._currentUser()?.role === 'Admin');

  // User ka naam
  readonly userName = computed(() => this._currentUser()?.fullName ?? '');

  constructor(
    private api: ApiService,
    private router: Router
  ) {
    // App start hone par localStorage se user load karo
    // Page refresh hone par bhi logged in rahe
    this.loadUserFromStorage();
  }

  // ─────────────────────────────────────────
  // Register — Naya user banao
  // ─────────────────────────────────────────
  register(fullName: string, email: string, password: string):
    Observable<ApiResponse<AuthResponse>>
  {
    return this.api.post<ApiResponse<AuthResponse>>('auth/register', {
      fullName,
      email,
      password
    }).pipe(
      // Response aane par automatically token save karo
      tap(response => {
        if (response.success) {
          this.saveUserToStorage(response.data);
        }
      })
    );
  }

  // ─────────────────────────────────────────
  // Login — Existing user login karo
  // ─────────────────────────────────────────
  login(email: string, password: string):
    Observable<ApiResponse<AuthResponse>>
  {
    return this.api.post<ApiResponse<AuthResponse>>('auth/login', {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success) {
          // Token aur user info save karo
          this.saveUserToStorage(response.data);
        }
      })
    );
  }

  // ─────────────────────────────────────────
  // Logout — Token clear karo
  // ─────────────────────────────────────────
  logout(): void {
    // localStorage se sab clear karo
    localStorage.removeItem(environment.tokenStorageKey);
    localStorage.removeItem(environment.userStorageKey);

    // Signal null karo — poori app mein update ho jayega
    this._currentUser.set(null);

    // Login page par bhejo
    this.router.navigate(['/auth/login']);
  }

  // ─────────────────────────────────────────
  // Token nikalo — API calls ke liye
  // ─────────────────────────────────────────
  getToken(): string | null {
    return localStorage.getItem(environment.tokenStorageKey);
  }

  // ─────────────────────────────────────────
  // Token expire hua ya nahi check karo
  // ─────────────────────────────────────────
  isTokenValid(): boolean {
    const user = this._currentUser();
    if (!user) return false;

    // ExpiresAt se compare karo
    const expiryDate = new Date(user.expiresAt);
    return expiryDate > new Date();
  }

  // ─────────────────────────────────────────
  // Private Helper Methods
  // ─────────────────────────────────────────

  // User localStorage mein save karo
  private saveUserToStorage(user: AuthResponse): void {
    localStorage.setItem(
      environment.tokenStorageKey,
      user.token
    );
    localStorage.setItem(
      environment.userStorageKey,
      JSON.stringify(user)
    );
    // Signal update karo
    this._currentUser.set(user);
  }

  // App start par localStorage se user load karo
  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(environment.userStorageKey);
    if (userJson) {
      try {
        const user: AuthResponse = JSON.parse(userJson);
        // Token valid hai toh load karo
        const expiryDate = new Date(user.expiresAt);
        if (expiryDate > new Date()) {
          this._currentUser.set(user);
        } else {
          // Token expire ho gaya — clear karo
          this.logout();
        }
      } catch {
        // JSON parse error — clear karo
        localStorage.removeItem(environment.userStorageKey);
      }
    }
  }
}