import { Component, inject } from '@angular/core';
import { SettingsService } from '../core/services/settings.service';

@Component({
  selector: 'app-whatsapp',
  imports: [],
  templateUrl: './whatsapp.html',
  styleUrl: './whatsapp.scss',
})
export class Whatsapp {
  settings = inject(SettingsService);

  get whatsappUrl(): string {
    const number = this.settings.whatsappNumber().replace(/[^0-9+]/g, '');
    if (!number) return '#';
    return `https://wa.me/${number}?text=${encodeURIComponent('Hi, I need help with my order')}`;
  }
}
