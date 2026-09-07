import { Component, computed, inject, OnInit, signal, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HomeService, Banner, SiteNotification, Testimonial, WhyChooseUsItem } from '../../core/services/home.service';
import { AppConfigService } from '../../core/services/app-config.service';
import { SettingsService } from '../../core/services/settings.service';
import { AuthService } from '../../core/services/auth.service';
import { ImageService } from '../../core/services/image.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { gsap } from 'gsap';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  private homeService = inject(HomeService);
  private el = inject(ElementRef);
  config = inject(AppConfigService);
  settings = inject(SettingsService);
  auth = inject(AuthService);
  imageService = inject(ImageService);
  recentlyViewed = inject(RecentlyViewedService);

  banners = signal<Banner[]>([]);
  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  recentlyViewedProducts = computed(() => {
    const products = this.products();
    return this.recentlyViewed.productIds()
      .map(id => products.find(product => product.id === id))
      .filter((product): product is Product => !!product);
  });
  displayProducts = computed(() =>
    this.recentlyViewedProducts().length > 0
      ? this.recentlyViewedProducts()
      : this.products().slice(0, 8)
  );
  notification = signal<SiteNotification | null>(null);
  testimonials = signal<Testimonial[]>([]);
  whyChooseUs = signal<WhyChooseUsItem[]>([]);

  isLoading = signal(true);
  errorMessage = signal('');
  activeBannerIndex = signal(0);
  showNotification = signal(true);

  private animationsPlayed = false;
  private carouselInterval: any = null;
  private observers: IntersectionObserver[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    if (!this.isLoading()) {
      this.playAnimations();
    }
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) clearInterval(this.carouselInterval);
    this.observers.forEach(o => o.disconnect());
  }

  loadData(): void {
    this.isLoading.set(true);

    this.homeService.loadHomeData().subscribe({
      next: (data) => {
        if (data.banners.success && data.banners.data) this.banners.set(data.banners.data);
        if (data.categories.success && data.categories.data) this.categories.set(data.categories.data.slice(0, 8));
        if (data.products.success && data.products.data) this.products.set(data.products.data);
        if (data.notification.success && data.notification.data) this.notification.set(data.notification.data);
        if (data.testimonials.success && data.testimonials.data) this.testimonials.set(data.testimonials.data);
        if (data.whyChooseUs.success && data.whyChooseUs.data) this.whyChooseUs.set(data.whyChooseUs.data);

        this.isLoading.set(false);

        setTimeout(() => {
          this.playAnimations();
          this.startCarousel();
          this.setupScrollAnimations();
        }, 100);
      },
      error: () => {
        this.errorMessage.set('Failed to load data');
        this.isLoading.set(false);
      }
    });
  }

  private startCarousel(): void {
    if (this.banners().length > 1) {
      this.carouselInterval = setInterval(() => this.nextBanner(), 5000);
    }
  }

  private playAnimations(): void {
    if (this.animationsPlayed) return;
    this.animationsPlayed = true;

    const host = this.el.nativeElement;
    const q = (sel: string) => host.querySelector(sel);
    const qa = (sel: string) => host.querySelectorAll(sel);

    const heroText = q('.hero-text');
    const heroImage = q('.hero-image');
    const heroStats = q('.hero-stats');

    if (heroText) {
      gsap.fromTo(heroText, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      gsap.fromTo(heroText.querySelectorAll('.hero-badge, .hero-title, .hero-sub, .hero-btns'),
        { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out', delay: 0.15 });
    }

    if (heroImage) {
      gsap.fromTo(heroImage, { opacity: 0, scale: 0.9, x: 30 }, { opacity: 1, scale: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.3 });
    }

    if (heroStats) {
      gsap.fromTo(heroStats.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.6 });
    }
  }

  private setupScrollAnimations(): void {
    const host = this.el.nativeElement;

    const animateOnScroll = (selector: string, fromVars: any, toVars: any, stagger = 0.1) => {
      const elements = host.querySelectorAll(selector);
      if (!elements.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            gsap.fromTo(entry.target, fromVars, { ...toVars, duration: toVars.duration || 0.6 });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      elements.forEach((el: Element) => observer.observe(el));
      this.observers.push(observer);
    };

    animateOnScroll('.cat-card',
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' });

    animateOnScroll('.prod-card',
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' });

    animateOnScroll('.wcu-card',
      { opacity: 0, y: 50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(1.4)' });

    animateOnScroll('.testi-card',
      { opacity: 0, y: 40, rotateX: 10 },
      { opacity: 1, y: 0, rotateX: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out' });

    animateOnScroll('.promo-card',
      { opacity: 0, y: 30, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out' });

    animateOnScroll('.feature',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' });

    const statsSection = host.querySelector('.stats-section');
    if (statsSection) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateStats(entry.target);
            statsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      statsObserver.observe(statsSection);
      this.observers.push(statsObserver);
    }
  }

  private animateStats(container: Element): void {
    const counters = container.querySelectorAll('[data-target]');
    if (!counters.length) return;

    gsap.fromTo(container.querySelectorAll('.stat-item'),
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(1.2)' });

    counters.forEach((el, i) => {
      const target = parseInt(el.getAttribute('data-target') || '0', 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const obj = { val: 0 };

      gsap.to(obj, {
        val: target,
        duration: 2.2,
        delay: 0.4 + i * 0.18,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = Math.round(obj.val).toLocaleString() + suffix;
        }
      });
    });
  }

  nextBanner(): void {
    const total = this.banners().length;
    if (total === 0) return;
    this.activeBannerIndex.update(i => (i + 1) % total);
  }

  prevBanner(): void {
    const total = this.banners().length;
    if (total === 0) return;
    this.activeBannerIndex.update(i => (i - 1 + total) % total);
  }

  goToBanner(index: number): void {
    this.activeBannerIndex.set(index);
  }

  get activeBanner(): Banner | null {
    const list = this.banners();
    if (list.length === 0) return null;
    return list[this.activeBannerIndex()] ?? null;
  }

  formatPrice(price: number): string {
    return this.config.formatPrice(price);
  }

  closeNotification(): void {
    this.showNotification.set(false);
    localStorage.setItem('libas_junior_notif_closed', 'true');
  }

  scrollCategories(direction: 'left' | 'right'): void {
    const container = this.el.nativeElement.querySelector('.categories-track');
    if (!container) return;
    container.scrollBy({ left: direction === 'left' ? -280 : 280, behavior: 'smooth' });
  }

  getStars(rating: number): string {
    return '★'.repeat(Math.min(rating, 5)) + '☆'.repeat(Math.max(0, 5 - rating));
  }
}
