import { Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  // Signals — reactive values
  // environment se aata hai — hardcoded nahi
  readonly appName = signal(environment.appName);
  readonly appTagline = signal(environment.appTagline);
  readonly appDescription = signal(environment.appDescription);
  readonly currencySymbol = signal(environment.currencySymbol);
  readonly apiUrl = signal(environment.apiUrl);

  constructor(private titleService: Title) {
    // Browser tab title set karo
    this.titleService.setTitle(environment.appName);
  }

  // Page title set karo — "Products | Solera"
  setPageTitle(pageName: string) {
    this.titleService.setTitle(
      `${pageName} | ${environment.appName}`
    );
  }

  // Price format karo — "Rs. 1,500"
  formatPrice(price: number): string {
    return `${environment.currencySymbol} ${price.toLocaleString()}`;
  }
}