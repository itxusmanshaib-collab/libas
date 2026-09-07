import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { AppConfigService } from '../core/services/app-config.service';
import { CartService } from '../core/services/cart.service';
import { SettingsService } from '../core/services/settings.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  auth = inject(AuthService);
  config = inject(AppConfigService);
  cart = inject(CartService);
  settings = inject(SettingsService);

  showAnnouncement = signal(
    localStorage.getItem('libas_junior_announcement') !== 'hidden'
  );

  showUserMenu = signal(false);
  showMobileMenu = signal(false);
  isScrolled = signal(false);

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.cart.loadCart().subscribe();
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 10);
  }

  closeAnnouncement(): void {
    localStorage.setItem('libas_junior_announcement', 'hidden');
    this.showAnnouncement.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.update(v => !v);
  }

  getUserInitials(): string {
    const name = this.auth.userName();
    if (!name) return 'U';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-wrap')) {
      this.showUserMenu.set(false);
    }
  }

  logout(): void {
    this.showUserMenu.set(false);
    this.auth.logout();
  }
}
