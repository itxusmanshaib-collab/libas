import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Whatsapp } from './whatsapp/whatsapp';
import { SettingsService } from './core/services/settings.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Whatsapp],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private settings = inject(SettingsService);
  private router = inject(Router);
  showHeaderFooter = true;

  ngOnInit(): void {
    this.settings.loadSettings();
    this.router.events.subscribe(() => {
      // Hide header/footer on admin routes
      this.showHeaderFooter = !this.router.url.startsWith('/admin');
    });
  }
}
