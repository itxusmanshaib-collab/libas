import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AppConfigService } from '../../core/services/app-config.service';
import { ImageService } from '../../core/services/image.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);
  config = inject(AppConfigService);
  private imageService = inject(ImageService);

  cart = this.cartService.cart;

  isLoading = signal(true);
  errorMessage = signal('');
  updatingItemId = signal<number | null>(null);
  clearingCart = signal(false);

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.cartService.loadCart().subscribe({
      next: () => this.isLoading.set(false),
      error: () => {
        this.errorMessage.set('Failed to load cart. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  increaseQty(cartItemId: number, currentQty: number, stock: number): void {
    if (currentQty >= stock) return;
    this.updateQty(cartItemId, currentQty + 1);
  }

  decreaseQty(cartItemId: number, currentQty: number): void {
    if (currentQty <= 1) return;
    this.updateQty(cartItemId, currentQty - 1);
  }

  private updateQty(cartItemId: number, quantity: number): void {
    this.updatingItemId.set(cartItemId);
    this.cartService.updateQuantity(cartItemId, quantity).subscribe({
      next: () => this.updatingItemId.set(null),
      error: () => {
        this.errorMessage.set('Failed to update quantity — check stock');
        this.updatingItemId.set(null);
      }
    });
  }

  removeItem(cartItemId: number): void {
    this.updatingItemId.set(cartItemId);
    this.cartService.removeItem(cartItemId).subscribe({
      next: () => this.updatingItemId.set(null),
      error: () => {
        this.errorMessage.set('Failed to remove item');
        this.updatingItemId.set(null);
      }
    });
  }

  clearCart(): void {
    if (!confirm('Clear entire cart?')) return;
    this.clearingCart.set(true);
    this.cartService.clearCart().subscribe({
      next: () => this.clearingCart.set(false),
      error: () => this.clearingCart.set(false)
    });
  }

  formatPrice(price: number): string {
    return this.config.formatPrice(price);
  }

  getImageUrl(path: string): string {
    return this.imageService.getImageUrl(path);
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
