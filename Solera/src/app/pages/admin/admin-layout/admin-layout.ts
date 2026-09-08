import { Component, DestroyRef, inject, signal } from '@angular/core';
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

  constructor() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.isSidebarOpen.set(false));
  }
}