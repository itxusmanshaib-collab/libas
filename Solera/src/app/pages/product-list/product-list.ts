import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, ProductFilters } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { AppConfigService } from '../../core/services/app-config.service';
import { ImageService } from '../../core/services/image.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { CustomDropdownComponent, DropdownOption } from '../../shared/components/custom-dropdown/custom-dropdown';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CustomDropdownComponent],
  templateUrl: './product-list.html',
    styleUrls: ['./product-list.scss']
})
export class ProductListComponent implements OnInit {

  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  config = inject(AppConfigService);
  imageService = inject(ImageService);
  wishlist = inject(WishlistService);

  // Raw data
  allProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);

  // Filter state
  selectedCategoryId = signal<number | null>(null);
  keyword = signal('');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  inStockOnly = signal(true);
  sortBy = signal<string>('featured');
  viewMode = signal<'grid' | 'list'>('grid');

  sortOptions: DropdownOption[] = [
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Newest First', value: 'newest' },
  ];

  // Pagination
  currentPage = signal(1);
  pageSize = 12;

  // UI state
  isLoading = signal(true);
  addingToCart = signal<number | null>(null);
  successMessage = signal('');
  errorMessage = signal('');
  quantities = signal<Record<number, number>>({});

  // Filtered + sorted products — computed
  filteredProducts = computed(() => {
    let products = this.allProducts();

    // Category filter
    const catId = this.selectedCategoryId();
    if (catId) {
      products = products.filter(p => p.categoryId === catId);
    }

    // Keyword filter
    const kw = this.keyword().toLowerCase();
    if (kw) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(kw) ||
        p.description.toLowerCase().includes(kw)
      );
    }

    // Price filter
    const min = this.minPrice();
    const max = this.maxPrice();
    if (min !== null) products = products.filter(p => p.price >= min);
    if (max !== null) products = products.filter(p => p.price <= max);

    // Stock filter
    if (this.inStockOnly()) {
      products = products.filter(p => p.stock > 0);
    }

    // Sort
    switch (this.sortBy()) {
      case 'price_asc':
        products = [...products].sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products = [...products].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        products = [...products].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return products;
  });

  // Paginated products
  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
  });

  // Total pages
  totalPages = computed(() =>
    Math.ceil(this.filteredProducts().length / this.pageSize)
  );

  // Pages array for pagination UI
  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  // Active filters count
  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.selectedCategoryId()) count++;
    if (this.keyword()) count++;
    if (this.minPrice() !== null) count++;
    if (this.maxPrice() !== null) count++;
    if (!this.inStockOnly()) count++;
    return count;
  });

  ngOnInit(): void {
    // URL se category param lo
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategoryId.set(+params['category']);
      }
      if (params['search']) {
        this.keyword.set(params['search']);
      }
    });

    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    // Products aur categories ek saath load karo
    this.productService.getCategories().subscribe({
      next: (res) => {
        if (res.success) this.categories.set(res.data);
      }
    });

    this.productService.getAllProducts().subscribe({
      next: (res) => {
        if (res.success) this.allProducts.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load products');
        this.isLoading.set(false);
      }
    });
  }

  // Category select
  selectCategory(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
    this.currentPage.set(1);
    // URL update karo
    this.router.navigate([], {
      queryParams: categoryId ? { category: categoryId } : {},
      replaceUrl: true
    });
  }

  // Sort change
  onSortChange(value: string): void {
    this.sortBy.set(value);
    this.currentPage.set(1);
  }

  // Price filter apply
  applyPriceFilter(min: string, max: string): void {
    this.minPrice.set(min ? +min : null);
    this.maxPrice.set(max ? +max : null);
    this.currentPage.set(1);
  }

  // Clear filters
  clearFilters(): void {
    this.selectedCategoryId.set(null);
    this.keyword.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.inStockOnly.set(true);
    this.sortBy.set('featured');
    this.currentPage.set(1);
    this.router.navigate(['/products']);
  }

  // Page change
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Add to cart
  quantityFor(product: Product): number {
    return this.quantities()[product.id] || 1;
  }

  changeQuantity(product: Product, amount: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const quantity = Math.max(1, Math.min(product.stock, this.quantityFor(product) + amount));
    this.quantities.set({ ...this.quantities(), [product.id]: quantity });
  }

  addToCart(product: Product, event: Event, quantity = this.quantityFor(product)): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'],
        { queryParams: { returnUrl: '/products' } }
      );
      return;
    }

    if (product.stock === 0) return;

    this.addingToCart.set(product.id);
    this.errorMessage.set('');

    this.cartService.addToCart(product.id, quantity).subscribe({
      next: (res) => {
        this.addingToCart.set(null);
        if (res.success) {
          this.successMessage.set(`${product.name} (x${quantity}) added to cart!`);
          setTimeout(() => this.successMessage.set(''), 3000);
        }
      },
      error: () => {
        this.addingToCart.set(null);
        this.errorMessage.set('Failed to add to cart');
      }
    });
  }

  toggleWishlist(product: Product, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlist.toggle(product.id);
  }

  // Price format
  formatPrice(price: number): string {
    return this.config.formatPrice(price);
  }

  // Category name
  getCategoryName(categoryId: number): string {
    return this.categories().find(c => c.id === categoryId)?.name ?? '';
  }

  // View toggle
  setView(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  // Stock badge
  getStockBadge(product: Product): string | null {
    if (product.stock === 0) return 'Out of stock';
    if (product.stock < 5) return 'Low stock';
    return null;
  }
}