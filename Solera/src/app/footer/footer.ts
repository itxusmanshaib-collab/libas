import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppConfigService } from '../core/services/app-config.service';
import { SettingsService } from '../core/services/settings.service';

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class Footer {
  config = inject(AppConfigService);
  settings = inject(SettingsService);

  currentYear = new Date().getFullYear();

  socialLinks = [
    { name: 'Facebook', url: this.settings.facebookUrl() || 'https://facebook.com/soleraskincare', icon: 'M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z' },
    { name: 'Instagram', url: this.settings.instagramUrl() || 'https://instagram.com/soleraskincare', icon: 'M12 2c2.7 0 3.1 0 4.1.1 1.1 0 1.8.2 2.5.5.7.3 1.2.6 1.8 1.2.6.6.9 1.1 1.2 1.8.3.7.5 1.4.5 2.5.1 1 .1 1.4.1 4.1s0 3.1-.1 4.1c0 1.1-.2 1.8-.5 2.5-.3.7-.6 1.2-1.2 1.8-.6.6-1.1.9-1.8 1.2-.7.3-1.4.5-2.5.5-1 .1-1.4.1-4.1.1s-3.1 0-4.1-.1c-1.1 0-1.8-.2-2.5-.5-.7-.3-1.2-.6-1.8-1.2-.6-.6-.9-1.1-1.2-1.8-.3-.7-.5-1.4-.5-2.5C2 15.1 2 14.7 2 12s0-3.1.1-4.1c0-1.1.2-1.8.5-2.5.3-.7.6-1.2 1.2-1.8.6-.6 1.1-.9 1.8-1.2.7-.3 1.4-.5 2.5-.5C8.9 2 9.3 2 12 2Zm0 1.8c-2.6 0-3 0-4 .1-.9 0-1.4.2-1.7.3-.4.2-.7.3-1 .6-.3.3-.5.6-.6 1-.1.3-.3.8-.3 1.7-.1 1-.1 1.4-.1 4s0 3 .1 4c0 .9.2 1.4.3 1.7.2.4.3.7.6 1 .3.3.6.5 1 .6.3.1.8.3 1.7.3 1 .1 1.4.1 4 .1s3 0 4-.1c.9 0 1.4-.2 1.7-.3.4-.2.7-.3 1-.6.3-.3.5-.6.6-1 .1-.3.3-.8.3-1.7.1-1 .1-1.4.1-4s0-3-.1-4c0-.9-.2-1.4-.3-1.7-.2-.4-.3-.7-.6-1-.3-.3-.6-.5-1-.6-.3-.1-.8-.3-1.7-.3-1-.1-1.4-.1-4-.1Zm0 3.5a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Zm0 1.8a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Zm5-2a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z' },
    { name: 'TikTok', url: 'https://tiktok.com/@soleraskincare', icon: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9a6.34 6.34 0 1 0 5.45 6.28V9.41a8.16 8.16 0 0 0 4.77 1.52V7.49a4.85 4.85 0 0 1-1-.8Z' },
    { name: 'LinkedIn', url: 'https://linkedin.com/company/soleraskincare', icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2ZM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z' }
  ];

  quickLinks = [
    { label: 'Shop All', path: '/products' },
    { label: 'Track Order', path: '/track-order' },
    { label: 'My Orders', path: '/profile/orders' },
    { label: 'Cart', path: '/cart' }
  ];

  companyLinks = [
    { label: 'About Us', path: '/about' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms & Conditions', path: '/terms' }
  ];

  newsletterEmail = signal('');
  newsletterMessage = signal('');
  newsletterSuccess = signal(false);

  subscribeNewsletter(): void {
    const email = this.newsletterEmail().trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      this.newsletterSuccess.set(false);
      this.newsletterMessage.set('Please enter a valid email address');
      return;
    }

    this.newsletterSuccess.set(true);
    this.newsletterMessage.set('Thank you! You are now subscribed');
    this.newsletterEmail.set('');
  }
}
