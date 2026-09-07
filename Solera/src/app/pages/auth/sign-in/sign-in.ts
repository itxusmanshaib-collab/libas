import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppConfigService } from '../../../core/services/app-config.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.scss'],
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  config = inject(AppConfigService);

  // Form data
  email = '';
  password = '';

  // UI State — signals
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  // Per-field errors
  emailError = signal('');
  passwordError = signal('');

  onLogin(): void {
    this.errorMessage.set('');
    this.emailError.set('');
    this.passwordError.set('');

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

    this.isLoading.set(true);

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Login failed. Please try again.');
      }
    });
  }
}