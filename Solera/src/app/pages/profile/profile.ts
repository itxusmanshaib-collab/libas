// import { Component, inject, OnInit, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterLink } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { ProfileService } from '../../core/services/profile.service';
// import { AuthService } from '../../core/services/auth.service';
// import { AppConfigService } from '../../core/services/app-config.service';
// import { ProfileResponse } from '../../core/models/profile.model';

// @Component({
//   selector: 'app-profile',
//   standalone: true,
//   imports: [CommonModule, RouterLink, FormsModule],
//   templateUrl: './profile.html',
//   styleUrls: ['./profile.scss']
// })
// export class ProfileComponent implements OnInit {
//   private profileService = inject(ProfileService);
//   auth = inject(AuthService);
//   config = inject(AppConfigService);

//   profile = signal<ProfileResponse | null>(null);
//   isLoading = signal(true);
//   activeTab = signal<'info' | 'password'>('info');

//   // Edit form
//   fullName = signal('');
//   isSaving = signal(false);
//   saveMessage = signal('');
//   saveError = signal('');

//   // Password form
//   currentPassword = signal('');
//   newPassword = signal('');
//   confirmPassword = signal('');
//   isChangingPassword = signal(false);
//   passwordMessage = signal('');
//   passwordError = signal('');

//   ngOnInit(): void {
//     this.loadProfile();
//   }

//   loadProfile(): void {
//     this.isLoading.set(true);
//     this.profileService.getProfile().subscribe({
//       next: (res) => {
//         if (res.success && res.data) {
//           this.profile.set(res.data);
//           this.fullName.set(res.data.fullName);
//         }
//         this.isLoading.set(false);
//       },
//       error: () => this.isLoading.set(false)
//     });
//   }

//   setTab(tab: 'info' | 'password'): void {
//     this.activeTab.set(tab);
//     this.saveMessage.set('');
//     this.saveError.set('');
//     this.passwordMessage.set('');
//     this.passwordError.set('');
//   }

//   saveProfile(): void {
//     if (!this.fullName().trim()) {
//       this.saveError.set('Naam khali nahi ho sakta');
//       return;
//     }
//     this.isSaving.set(true);
//     this.saveMessage.set('');
//     this.saveError.set('');

//     this.profileService.updateProfile({ fullName: this.fullName().trim() }).subscribe({
//       next: (res) => {
//         this.isSaving.set(false);
//         if (res.success) {
//           this.saveMessage.set('Profile update ho gayi ✓');
//           if (res.data) this.profile.set(res.data);
//         } else {
//           this.saveError.set(res.message || 'Update nahi ho saka');
//         }
//       },
//       error: (err) => {
//         this.isSaving.set(false);
//         this.saveError.set(err?.error?.message || 'Kuch ghalat ho gaya');
//       }
//     });
//   }

//   changePassword(): void {
//     this.passwordMessage.set('');
//     this.passwordError.set('');

//     if (!this.currentPassword() || !this.newPassword() || !this.confirmPassword()) {
//       this.passwordError.set('Sab fields fill karein');
//       return;
//     }
//     if (this.newPassword().length < 6) {
//       this.passwordError.set('Naya password kam az kam 6 characters ka ho');
//       return;
//     }
//     if (this.newPassword() !== this.confirmPassword()) {
//       this.passwordError.set('New password aur confirm password match nahi karte');
//       return;
//     }

//     this.isChangingPassword.set(true);
//     this.profileService.changePassword({
//       currentPassword: this.currentPassword(),
//       newPassword: this.newPassword(),
//       confirmPassword: this.confirmPassword()
//     }).subscribe({
//       next: (res) => {
//         this.isChangingPassword.set(false);
//         if (res.success) {
//           this.passwordMessage.set('Password change ho gaya ✓');
//           this.currentPassword.set('');
//           this.newPassword.set('');
//           this.confirmPassword.set('');
//         } else {
//           this.passwordError.set(res.message || 'Password change nahi hua');
//         }
//       },
//       error: (err) => {
//         this.isChangingPassword.set(false);
//         this.passwordError.set(err?.error?.message || 'Current password ghalat ho sakta hai');
//       }
//     });
//   }

//   formatPrice(price: number): string {
//     return this.config.formatPrice(price);
//   }

//   memberSince(dateStr: string): string {
//     return new Date(dateStr).toLocaleDateString('en-PK', { year: 'numeric', month: 'long' });
//   }
// }
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { AppConfigService } from '../../core/services/app-config.service';
import { ImageService } from '../../core/services/image.service';

interface ProfileData {
  id: number;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

interface Order {
  id: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  deliveryAddress: string;
  items: any[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {

  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  config = inject(AppConfigService);
  private imageService = inject(ImageService);

  // Data
  profile = signal<ProfileData | null>(null);
  orders = signal<Order[]>([]);
  isLoadingOrders = signal(true);

  // Active tab
  activeTab = signal<'profile' | 'orders' | 'password'>('profile');

  // UI State
  isLoading = signal(true);
  isUpdatingProfile = signal(false);
  isChangingPassword = signal(false);

  // Messages
  profileSuccess = signal('');
  profileError = signal('');
  passwordSuccess = signal('');
  passwordError = signal('');

  // Profile form
  editFullName = '';

  // Password form
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Selected order
  selectedOrder = signal<Order | null>(null);

  ngOnInit(): void {
    this.loadProfile();
    this.loadOrders();
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        if (res.success) {
          this.profile.set(res.data);
          this.editFullName = res.data.fullName;
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadOrders(): void {
    this.isLoadingOrders.set(true);
    this.profileService.getMyOrders().subscribe({
      next: (res) => {
        if (res.success) this.orders.set(res.data);
        this.isLoadingOrders.set(false);
      },
      error: (err) => {
        console.error('Failed to load orders:', err);
        this.isLoadingOrders.set(false);
      }
    });
  }

  // Update profile
  updateProfile(): void {
    if (!this.editFullName.trim()) {
      this.profileError.set('Name cannot be empty');
      return;
    }

    this.isUpdatingProfile.set(true);
    this.profileError.set('');

    this.profileService.updateProfile(this.editFullName).subscribe({
      next: (res) => {
        this.isUpdatingProfile.set(false);
        if (res.success) {
          this.profile.update(p => p ? { ...p, fullName: this.editFullName } : p);
            this.profileSuccess.set('Profile updated successfully!');
          setTimeout(() => this.profileSuccess.set(''), 3000);
        } else {
          this.profileError.set(res.message);
        }
      },
      error: () => {
        this.isUpdatingProfile.set(false);
        this.profileError.set('Error — please try again');
      }
    });
  }

  // Change password
  changePassword(): void {
    if (!this.currentPassword || !this.newPassword) {
      this.passwordError.set('All fields are required');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('Passwords do not match');
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError.set('Password must be at least 6 characters');
      return;
    }

    this.isChangingPassword.set(true);
    this.passwordError.set('');

    this.profileService.changePassword(
      this.currentPassword,
      this.newPassword,
      this.confirmPassword
    ).subscribe({
      next: (res) => {
        this.isChangingPassword.set(false);
        if (res.success) {
          this.passwordSuccess.set('Password changed successfully!');
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
          setTimeout(() => this.passwordSuccess.set(''), 4000);
        } else {
          this.passwordError.set(res.message);
        }
      },
      error: () => {
        this.isChangingPassword.set(false);
        this.passwordError.set('Error — please try again');
      }
    });
  }

  // User initials
  getUserInitials(): string {
    const name = this.profile()?.fullName ?? '';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Status colors
  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      'Pending': '#e67e22', 'Processing': '#3498db',
      'Shipped': '#9b59b6', 'Delivered': '#27ae60', 'Cancelled': '#e74c3c'
    };
    return map[status] ?? '#888';
  }

  getStatusBg(status: string): string {
    const map: Record<string, string> = {
      'Pending': '#fff3e0', 'Processing': '#e8f4fd',
      'Shipped': '#f3e8ff', 'Delivered': '#f0fdf4', 'Cancelled': '#fef2f2'
    };
    return map[status] ?? '#f5f5f3';
  }

  // Format price
  formatPrice(price: number): string {
    return this.config.formatPrice(price);
  }

  getImageUrl(path: string): string {
    return this.imageService.getImageUrl(path);
  }

  // Logout
  logout(): void {
    this.authService.logout();
  }
}