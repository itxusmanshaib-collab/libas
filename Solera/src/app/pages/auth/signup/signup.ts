import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppConfigService } from '../../../core/services/app-config.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss'],
})
export class Register {

  private authService = inject(AuthService);
  private router = inject(Router);
  config = inject(AppConfigService);

  // Form data
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';

  // UI State
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // Per-field errors
  nameError = signal('');
  emailError = signal('');
  passwordError = signal('');
  confirmPasswordError = signal('');

  onRegister(): void {
    this.errorMessage.set('');
    this.nameError.set('');
    this.emailError.set('');
    this.passwordError.set('');
    this.confirmPasswordError.set('');

    if (!this.fullName.trim()) {
      this.nameError.set('Full name is required');
      return;
    }
    if (!this.email.trim()) {
      this.emailError.set('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.emailError.set('Please enter a valid email address');
      return;
    }
    if (!this.password) {
      this.passwordError.set('Password is required');
      return;
    }
    if (this.password.length < 6) {
      this.passwordError.set('Password must be at least 6 characters');
      return;
    }
    if (!this.confirmPassword) {
      this.confirmPasswordError.set('Please confirm your password');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.confirmPasswordError.set('Passwords do not match');
      return;
    }

    this.isLoading.set(true);

    this.authService.register(
      this.fullName,
      this.email,
      this.password
    ).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.successMessage.set(response.message || 'Registration successful. Please log in.');
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error.message || 'Registration failed. Please try again.');
      }
    });
  }
}