import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { AppConfigService } from '../../core/services/app-config.service';
import { ApiService } from '../../core/services/api.service';
import { ImageService } from '../../core/services/image.service';
import { Product } from '../../core/models/product.model';
import { WishlistService } from '../../core/services/wishlist.service';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service';

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
}

interface ReviewsData {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss']
})
export class ProductDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  config = inject(AppConfigService);
  auth = inject(AuthService);
  imageService = inject(ImageService);
  wishlist = inject(WishlistService);
  recentlyViewed = inject(RecentlyViewedService);

  product = signal<Product | null>(null);
  reviewsData = signal<ReviewsData | null>(null);

  isLoading = signal(true);
  isLoadingReviews = signal(true);
  isAddingToCart = signal(false);
  isSubmittingReview = signal(false);

  successMessage = signal('');
  errorMessage = signal('');
  reviewError = signal('');
  reviewSuccess = signal('');

  quantity = signal(1);
  selectedImageIndex = signal(0);
  reviewRating = signal(0);
  reviewComment = '';
  hoveredStar = signal(0);
  ratingBars = [5, 4, 3, 2, 1];
  selectedColor = signal('');
  selectedSize = signal('');
  selectedImage = signal('');

  private categoryNames: Record<number, string> = {};

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(+id);
      this.loadReviews(+id);
    }
  }

  loadProduct(id: number): void {
    this.isLoading.set(true);
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.product.set(res.data);
          this.selectedColor.set(this.variantOptions(res.data.availableColors)[0] || '');
          this.selectedSize.set(this.variantOptions(res.data.availableSizes)[0] || '');
          this.selectedImage.set(res.data.imageUrl || '');
          this.recentlyViewed.add(res.data.id);
          this.config.setPageTitle(res.data.name);
          this.loadCategoryName(res.data.categoryId);
        } else {
          this.router.navigate(['/products']);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/products']);
      }
    });
  }

  private loadCategoryName(categoryId: number): void {
    if (this.categoryNames[categoryId]) return;
    this.productService.getCategories().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const cats = Array.isArray(res.data) ? res.data : (res.data as any).items || [];
          cats.forEach((c: any) => {
            this.categoryNames[c.id] = c.name;
          });
        }
      }
    });
  }

  getCategoryName(): string {
    const product = this.product();
    if (!product) return '';
    return this.categoryNames[product.categoryId] || '';
  }

  loadReviews(productId: number): void {
    this.isLoadingReviews.set(true);
    this.productService.getProductReviews(productId).subscribe({
      next: (res) => {
        if (res.success) {
          this.reviewsData.set(res.data);
        }
        this.isLoadingReviews.set(false);
      },
      error: () => this.isLoadingReviews.set(false)
    });
  }

  increaseQty(): void {
    const product = this.product();
    if (product && this.quantity() < product.stock) {
      this.quantity.update(q => q + 1);
    }
  }

  decreaseQty(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    const product = this.product();
    if (!product || product.stock === 0) return;

    this.isAddingToCart.set(true);
    this.errorMessage.set('');

    if (this.variantOptions(product.availableColors).length > 0 && !this.selectedColor()) {
      this.errorMessage.set('Please select a color');
      this.isAddingToCart.set(false);
      return;
    }
    if (this.variantOptions(product.availableSizes).length > 0 && !this.selectedSize()) {
      this.errorMessage.set('Please select a size');
      this.isAddingToCart.set(false);
      return;
    }

    this.cartService.addToCart(product.id, this.quantity(), this.selectedColor(), this.selectedSize()).subscribe({
      next: (res) => {
        this.isAddingToCart.set(false);
        if (res.success) {
          this.successMessage.set(
            `${product.name} (x${this.quantity()}) added to cart!`
          );
          setTimeout(() => this.successMessage.set(''), 4000);
        } else {
          this.errorMessage.set(res.message);
        }
      },
      error: () => {
        this.isAddingToCart.set(false);
        this.errorMessage.set('Could not add to cart — please try again');
      }
    });
  }

  toggleWishlist(): void {
    const currentProduct = this.product();
    if (currentProduct) this.wishlist.toggle(currentProduct.id);
  }

  setHoveredStar(star: number): void {
    this.hoveredStar.set(star);
  }

  clearHoveredStar(): void {
    this.hoveredStar.set(0);
  }

  setRating(star: number): void {
    this.reviewRating.set(star);
  }

  isStarActive(star: number): boolean {
    return star <= (this.hoveredStar() || this.reviewRating());
  }

  submitReview(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.reviewRating() === 0) {
      this.reviewError.set('Please select a star rating');
      return;
    }

    if (!this.reviewComment.trim()) {
      this.reviewError.set('Please write a review comment');
      return;
    }

    const product = this.product();
    if (!product) return;

    this.isSubmittingReview.set(true);
    this.reviewError.set('');

    this.apiService.postSecure<any>('reviews', {
      productId: product.id,
      rating: this.reviewRating(),
      comment: this.reviewComment
    }).subscribe({
      next: (res) => {
        this.isSubmittingReview.set(false);
        if (res.success) {
          this.reviewSuccess.set(
            'Review submitted! It will appear after admin approval.'
          );
          this.reviewRating.set(0);
          this.reviewComment = '';
          setTimeout(() => this.reviewSuccess.set(''), 5000);
        } else {
          this.reviewError.set(res.message);
        }
      },
      error: () => {
        this.isSubmittingReview.set(false);
        this.reviewError.set('Failed to submit review');
      }
    });
  }

  getRatingPercent(star: number): number {
    const data = this.reviewsData();
    if (!data || data.totalReviews === 0) return 0;
    const count = data.reviews.filter(r => r.rating === star).length;
    return Math.round((count / data.totalReviews) * 100);
  }

  getStars(rating: number): string {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  }

  formatPrice(price: number): string {
    return this.config.formatPrice(price);
  }

  variantOptions(value: string[] | string | undefined): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return value.split(',').map(item => item.trim()).filter(Boolean); }
  }

  galleryImages(): string[] {
    const product = this.product();
    if (!product) return [];
    const gallery = this.variantOptions(product.galleryImages);
    return [product.imageUrl, ...gallery].filter((url, index, urls) => url && urls.indexOf(url) === index);
  }
}
