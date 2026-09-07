import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, SettingItem } from '../../../core/services/settings.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.scss',
})
export class AdminSettings implements OnInit {
  private settingsApi = inject(SettingsService);
  private router = inject(Router);

  settings = signal<SettingItem[]>([]);
  loading = signal(true);
  saving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  siteName = signal('');
  siteTagline = signal('');
  whatsappNumber = signal('');
  primaryColor = signal('');
  secondaryColor = signal('');
  facebookUrl = signal('');
  instagramUrl = signal('');
  footerText = signal('');
  heroEyebrow = signal('');
  heroTitle = signal('');
  heroSubtitle = signal('');
  heroButtonText = signal('');
  heroButtonUrl = signal('/products');
  heroBackground = signal('#12263a');
  heroTextColor = signal('#ffffff');
  legalAccent = signal('#d6a85f');
  legalPageBackground = signal('#f7f7f4');
  legalSurface = signal('#ffffff');
  legalHeading = signal('#12263a');

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);
    this.settingsApi.getAllSettings().subscribe({
      next: (res) => {
        const items = res.data ?? [];
        this.settings.set(items);
        this.populateForm(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private populateForm(items: SettingItem[]): void {
    const get = (key: string) => items.find(s => s.key === key)?.value || '';
    this.siteName.set(get('site_name'));
    this.siteTagline.set(get('site_tagline'));
    this.whatsappNumber.set(get('whatsapp_number'));
    this.primaryColor.set(get('theme_primary_color'));
    this.secondaryColor.set(get('theme_secondary_color'));
    this.facebookUrl.set(get('social_facebook'));
    this.instagramUrl.set(get('social_instagram'));
    this.footerText.set(get('footer_text'));
    this.heroEyebrow.set(get('home_hero_eyebrow'));
    this.heroTitle.set(get('home_hero_title'));
    this.heroSubtitle.set(get('home_hero_subtitle'));
    this.heroButtonText.set(get('home_hero_button_text'));
    this.heroButtonUrl.set(get('home_hero_button_url') || '/products');
    this.heroBackground.set(get('home_hero_background') || '#12263a');
    this.heroTextColor.set(get('home_hero_text_color') || '#ffffff');
    this.legalAccent.set(get('legal_accent_color') || '#d6a85f');
    this.legalPageBackground.set(get('legal_page_background') || '#f7f7f4');
    this.legalSurface.set(get('legal_surface_color') || '#ffffff');
    this.legalHeading.set(get('legal_heading_color') || '#12263a');
  }

  saveAll(): void {
    this.saving.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    const updates: { key: string; value: string }[] = [
      { key: 'site_name', value: this.siteName() },
      { key: 'site_tagline', value: this.siteTagline() },
      { key: 'whatsapp_number', value: this.whatsappNumber() },
      { key: 'theme_primary_color', value: this.primaryColor() },
      { key: 'theme_secondary_color', value: this.secondaryColor() },
      { key: 'social_facebook', value: this.facebookUrl() },
      { key: 'social_instagram', value: this.instagramUrl() },
      { key: 'footer_text', value: this.footerText() },
      { key: 'home_hero_eyebrow', value: this.heroEyebrow() },
      { key: 'home_hero_title', value: this.heroTitle() },
      { key: 'home_hero_subtitle', value: this.heroSubtitle() },
      { key: 'home_hero_button_text', value: this.heroButtonText() },
      { key: 'home_hero_button_url', value: this.heroButtonUrl() },
      { key: 'home_hero_background', value: this.heroBackground() },
      { key: 'home_hero_text_color', value: this.heroTextColor() },
      { key: 'legal_accent_color', value: this.legalAccent() },
      { key: 'legal_page_background', value: this.legalPageBackground() },
      { key: 'legal_surface_color', value: this.legalSurface() },
      { key: 'legal_heading_color', value: this.legalHeading() },
    ];

    this.settingsApi.bulkUpdateSettings(updates).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMsg.set('Settings saved successfully');
        this.settingsApi.loadSettings();
        setTimeout(() => this.successMsg.set(''), 4000);
      },
      error: () => {
        this.saving.set(false);
        this.errorMsg.set('Failed to save settings');
        setTimeout(() => this.errorMsg.set(''), 4000);
      }
    });
  }

  previewSite(): void {
    window.open(this.router.serializeUrl(this.router.createUrlTree(['/'])), '_blank', 'noopener');
  }
}
