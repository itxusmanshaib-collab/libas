import { Injectable, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';

export interface SettingItem {
  id: number;
  key: string;
  value: string;
  category: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private _settings = signal<SettingItem[]>([]);
  private _isLoading = signal(false);

  readonly settings = this._settings.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  readonly siteName = computed(() => this.get('site_name') || 'Libas Junior');
  readonly logoUrl = computed(() => this.get('logo_url') || 'assets/logo/logo.jpeg');
  readonly siteTagline = computed(() => this.get('site_tagline') || "Men's Denim, Made Better");
  readonly whatsappNumber = computed(() => this.get('whatsapp_number') || '');
  readonly primaryColor = computed(() => this.get('theme_primary_color') || this.get('primary_color') || '#12263a');
  readonly secondaryColor = computed(() => this.get('theme_secondary_color') || this.get('accent_color') || '#d6a85f');
  readonly heroEyebrow = computed(() => this.get('home_hero_eyebrow') || 'New season / 2026');
  readonly heroTitle = computed(() => this.get('home_hero_title') || 'Denim that moves with you');
  readonly heroSubtitle = computed(() => this.get('home_hero_subtitle') || 'Built for long days, late nights and everything in between.');
  readonly heroButtonText = computed(() => this.get('home_hero_button_text') || 'Shop the collection');
  readonly heroButtonUrl = computed(() => this.get('home_hero_button_url') || '/products');
  readonly heroBackground = computed(() => this.get('home_hero_background') || '#12263a');
  readonly heroTextColor = computed(() => this.get('home_hero_text_color') || '#ffffff');
  readonly legalAccent = computed(() => this.get('legal_accent_color') || this.secondaryColor());
  readonly legalPageBackground = computed(() => this.get('legal_page_background') || '#f7f7f4');
  readonly legalSurface = computed(() => this.get('legal_surface_color') || '#ffffff');
  readonly legalHeading = computed(() => this.get('legal_heading_color') || this.primaryColor());
  readonly footerText = computed(() => this.get('footer_text') || '');
  readonly facebookUrl = computed(() => this.get('social_facebook') || '');
  readonly instagramUrl = computed(() => this.get('social_instagram') || '');

  constructor(private api: ApiService) {}

  loadSettings(): void {
    this._isLoading.set(true);
    this.api.get<ApiResponse<SettingItem[]>>('settings').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this._settings.set(res.data);
          this.applyThemeColors();
        }
        this._isLoading.set(false);
      },
      error: () => {
        this._isLoading.set(false);
      }
    });
  }

  get(key: string): string {
    const setting = this._settings().find(s => s.key === key);
    return setting?.value || '';
  }

  getByCategory(category: string): SettingItem[] {
    return this._settings().filter(s => s.category === category);
  }

  getAllSettings() {
    return this.api.get<ApiResponse<SettingItem[]>>('settings');
  }

  bulkUpdateSettings(settings: { key: string; value: string }[]) {
    return this.api.putSecure<ApiResponse<any>>('settings/bulk', { settings });
  }

  private applyThemeColors(): void {
    const root = document.documentElement;
    const primary = this.get('theme_primary_color');
    const secondary = this.get('theme_secondary_color');

    if (primary) {
      root.style.setProperty('--color-primary', primary);
      root.style.setProperty('--purple-600', primary);
    }
    if (secondary) {
      root.style.setProperty('--color-accent', secondary);
      root.style.setProperty('--pink-500', secondary);
    }
    root.style.setProperty('--color-primary-light', `color-mix(in srgb, ${primary || '#12263a'} 72%, white)`);
    root.style.setProperty('--color-accent-dark', `color-mix(in srgb, ${secondary || '#d6a85f'} 78%, black)`);
    root.style.setProperty('--color-accent-light', `color-mix(in srgb, ${secondary || '#d6a85f'} 14%, white)`);
    root.style.setProperty('--hero-background', this.heroBackground());
    root.style.setProperty('--hero-text-color', this.heroTextColor());
  }
}
