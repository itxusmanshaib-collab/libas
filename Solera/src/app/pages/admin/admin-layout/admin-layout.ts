import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminConfirmDialogComponent } from '../../../shared/components/admin-confirm-dialog/admin-confirm-dialog';
import { AuthService } from '../../../core/services/auth.service';
import { AppConfigService } from '../../../core/services/app-config.service';
import { SettingsService } from '../../../core/services/settings.service';


@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, AdminConfirmDialogComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  config = inject(AppConfigService);
  settings = inject(SettingsService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  isSidebarOpen = signal(false);
  isSidebarVisible = signal(true);
  showProfileMenu = signal(false);
  currentRoute = signal('/admin');

  pageTitle = computed(() => {
    const route = this.currentRoute();
    const titles: Record<string, string> = {
      '/admin': 'Dashboard',
      '/admin/orders': 'Orders',
      '/admin/products': 'Products',
      '/admin/categories': 'Categories',
      '/admin/users': 'Users',
      '/admin/banners': 'Banners',
      '/admin/notifications': 'Notifications',
      '/admin/reviews': 'Reviews',
      '/admin/testimonials': 'Testimonials',
      '/admin/why-choose-us': 'Why Choose Us',
      '/admin/settings': 'Settings',
    };
    return titles[route] ?? 'Admin workspace';
  });

  userInitials = computed(() => {
    const name = this.auth.userName().trim();
    return name ? name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() : 'A';
  });

  constructor() {
    this.currentRoute.set(this.router.url.split('?')[0] || '/admin');
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => {
        this.currentRoute.set(event.urlAfterRedirects.split('?')[0]);
        this.isSidebarOpen.set(false);
        this.showProfileMenu.set(false);
      });
  }

  toggleProfileMenu(): void {
    this.showProfileMenu.update(open => !open);
  }

  closeProfileMenu(): void {
    this.showProfileMenu.set(false);
  }

  toggleSidebar(): void {
    if (window.matchMedia('(max-width: 768px)').matches) {
      this.isSidebarOpen.update(open => !open);
      return;
    }
    this.isSidebarVisible.update(visible => !visible);
  }

  searchWorkspace(value: string): void {
    const query = value.trim().toLowerCase();
    const destination = query.includes('order')
      ? '/admin/orders'
      : query.includes('product')
        ? '/admin/products'
        : query.includes('categor')
          ? '/admin/categories'
          : query.includes('user')
            ? '/admin/users'
            : query.includes('setting')
              ? '/admin/settings'
              : '/admin';
    this.router.navigate([destination]);
  }
}