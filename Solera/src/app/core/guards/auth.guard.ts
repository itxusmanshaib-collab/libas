import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Auth Guard — sirf logged in user access kar sake
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isTokenValid()) {
    return true; // Access do
  }

  // Login nahi hai — login page par bhejo
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

// Admin Guard — sirf Admin access kar sake
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true; // Admin hai — access do
  }

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
  } else {
    // Logged in hai but Admin nahi — home par bhejo
    router.navigate(['/']);
  }
  return false;
};