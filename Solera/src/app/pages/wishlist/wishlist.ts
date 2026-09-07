import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ImageService } from '../../core/services/image.service';
import { AppConfigService } from '../../core/services/app-config.service';
import { Product } from '../../core/models/product.model';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss'
})
export class WishlistComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private router = inject(Router);
  wishlist = inject(WishlistService);
  imageService = inject(ImageService);
  config = inject(AppConfigService);

  private products = signal<Product[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  addingToCart = signal<number | null>(null);
  successMessage = signal('');

  savedProducts = computed(() => {
    const ids = this.wishlist.productIds();
    return ids.map(id => this.products().find(product => product.id === id))
      .filter((product): product is Product => !!product);
  });

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe({
      next: response => {
        if (response.success) this.products.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('We could not load your saved pieces. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  remove(productId: number): void {
    this.wishlist.remove(productId);
  }

  clearAll(): void {
    this.wishlist.clear();
  }

  addToCart(product: Product): void {
    if (product.stock === 0) return;
    this.addingToCart.set(product.id);
    this.successMessage.set('');

    this.cartService.addToCart(product.id).subscribe({
      next: response => {
        this.addingToCart.set(null);
        if (response.success) {
          this.successMessage.set(`${product.name} added to your cart.`);
          setTimeout(() => this.successMessage.set(''), 3500);
        } else {
          this.errorMessage.set(response.message || 'Could not add this item to cart.');
        }
      },
      error: () => {
        this.addingToCart.set(null);
        this.errorMessage.set('Could not add this item to cart. Please sign in and try again.');
      }
    });
  }

  formatPrice(price: number): string {
    return this.config.formatPrice(price);
  }
}
