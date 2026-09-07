import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ImageService } from '../../core/services/image.service';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class CheckoutComponent implements OnInit {
  router = inject(Router);
  cartService = inject(CartService);
  auth = inject(AuthService);
  private imageService = inject(ImageService);

  cart = this.cartService.cart;

  submitting = signal(false);
  checkoutError = signal('');

  // Per-field errors
  nameError = signal('');
  phoneError = signal('');
  addressError = signal('');

  customerName = signal('');
  customerPhone = signal('');
  customerAddress = signal('');
  latitude = signal<number | null>(null);
  longitude = signal<number | null>(null);
  locationAddress = signal('');
  paymentMethod = signal<'cod' | 'card'>('cod');
  promoCode = signal('');
  promoMessage = signal('');
  promoSuccess = signal(false);

  subtotal = computed(() => this.cart()?.totalAmount ?? 0);
  shipping = computed(() => this.subtotal() >= 2500 ? 0 : 150);
  discount = computed(() => {
    const code = this.promoCode().toUpperCase();
    if (code === 'DENIM10') return Math.round(this.subtotal() * 0.10);
    return 0;
  });
  total = computed(() => this.subtotal() + this.shipping() - this.discount());

  ngOnInit(): void {
    if (this.cart() === null || (this.cart()?.items.length ?? 0) === 0) {
      this.router.navigate(['/cart']);
    }
  }

  getImageUrl(path: string): string {
    return this.imageService.getImageUrl(path);
  }

  useLocation(): void {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.latitude.set(pos.coords.latitude);
        this.longitude.set(pos.coords.longitude);
        this.locationAddress.set(
          `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`
        );
      },
      () => {}
    );
  }

  applyPromo(): void {
    const code = this.promoCode().toUpperCase().trim();
    if (code === 'DENIM10') {
      this.promoSuccess.set(true);
      this.promoMessage.set(`Promo applied! -Rs. ${this.discount().toLocaleString()}`);
    } else if (!code) {
      this.promoSuccess.set(false);
      this.promoMessage.set('Please enter a promo code');
    } else {
      this.promoSuccess.set(false);
      this.promoMessage.set('Invalid promo code');
    }
  }

  placeOrder(): void {
    this.checkoutError.set('');
    this.nameError.set('');
    this.phoneError.set('');
    this.addressError.set('');

    if (!this.customerName().trim()) {
      this.nameError.set('Full name is required');
      return;
    }
    if (!this.customerPhone().trim()) {
      this.phoneError.set('Phone number is required');
      return;
    }
    if (!/^\d{10,15}$/.test(this.customerPhone().replace(/[\s\-\+]/g, ''))) {
      this.phoneError.set('Enter a valid phone number (10-15 digits)');
      return;
    }
    if (!this.customerAddress().trim()) {
      this.addressError.set('Delivery address is required');
      return;
    }

    this.submitting.set(true);

    this.cartService.checkout({
      deliveryAddress: this.customerAddress(),
      phoneNumber: this.customerPhone(),
      latitude: this.latitude() ?? undefined,
      longitude: this.longitude() ?? undefined,
      locationAddress: this.locationAddress() || undefined,
    }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.router.navigate(['/order-success']);
        }
      },
      error: () => {
        this.submitting.set(false);
      }
    });
  }
}
