import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { AppConfigService } from '../../../../core/services/app-config.service';
import { ImageService } from '../../../../core/services/image.service';
import { Product } from '../../../../core/models/product.model';
import { Category } from '../../../../core/models/category.model';
import { CustomDropdownComponent, DropdownOption } from '../../../../shared/components/custom-dropdown/custom-dropdown';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDropdownComponent],
  templateUrl: './admin-products.html',
})
export class AdminProductsComponent implements OnInit {

  private api = inject(ApiService);
  config = inject(AppConfigService);
  imageService = inject(ImageService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  showForm = signal(false);
  isSubmitting = signal(false);
  editingProduct = signal<Product | null>(null);
  successMessage = signal('');
  errorMessage = signal('');
  uploadingImage = signal(false);
  validationErrors = signal<Record<string, string>>({});

  statusOptions: DropdownOption[] = [
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' },
  ];

  get categoryOptions(): DropdownOption[] {
    return [
      { label: 'Select category', value: 0 },
      ...this.categories().map(c => ({ label: c.name, value: c.id })),
    ];
  }

  // Form data
  form = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    galleryImages: '',
    availableColors: '',
    availableSizes: '',
    categoryId: 0,
    isActive: true,
    discountPercentage: 0,
    discountAmount: 0,
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.api.getSecure<any>('products').subscribe({
      next: (res) => {
        if (res.success) this.products.set(res.data);
        this.isLoading.set(false);
      }
    });

    this.api.get<any>('categories').subscribe({
      next: (res) => {
        if (res.success) this.categories.set(res.data);
      }
    });
  }

  openAddForm(): void {
    this.editingProduct.set(null);
    this.form = {
      name: '', description: '', price: 0,
      stock: 0, imageUrl: '', categoryId: 0, isActive: true,
      galleryImages: '', availableColors: '', availableSizes: '',
      discountPercentage: 0, discountAmount: 0,
    };
    this.showForm.set(true);
  }

  openEditForm(product: Product): void {
    this.editingProduct.set(product);
    this.form = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      galleryImages: this.toCsv(product.galleryImages),
      availableColors: this.toCsv(product.availableColors),
      availableSizes: this.toCsv(product.availableSizes),
      categoryId: product.categoryId,
      isActive: product.isActive,
      discountPercentage: product.discountPercentage ?? 0,
      discountAmount: product.discountAmount ?? 0,
    };
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingProduct.set(null);
    this.errorMessage.set('');
  }

  uploadImages(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.uploadingImage.set(true);
    const uploads = Array.from(input.files).map(file => {
      const formData = new FormData();
      formData.append('file', file);
      return this.api.postSecureFormData<any>('uploads/image', formData);
    });

    forkJoin(uploads).subscribe({
      next: responses => {
        const urls = responses
          .filter(res => res.success && res.data)
          .map(res => typeof res.data === 'string' ? res.data : res.data.url || res.data.imageUrl || '')
          .filter(Boolean);
        if (!this.form.imageUrl && urls.length) this.form.imageUrl = urls.shift()!;
        this.form.galleryImages = [...this.toList(this.form.galleryImages), ...urls]
          .filter((url, index, all) => all.indexOf(url) === index).join(', ');
        this.uploadingImage.set(false);
        this.clearFieldError('images');
      },
      error: () => {
        this.uploadingImage.set(false);
        this.setFieldError('images', 'One or more images could not be uploaded');
      }
    });
    input.value = '';
  }

  removeGalleryImage(url: string): void {
    this.form.galleryImages = this.toList(this.form.galleryImages)
      .filter(image => image !== url).join(', ');
  }

  saveProduct(): void {
    const errors: Record<string, string> = {};
    if (!this.form.name.trim()) errors['name'] = 'Product name is required';
    if (!this.form.price || this.form.price <= 0) errors['price'] = 'Enter a valid price';
    if (this.form.stock < 0) errors['stock'] = 'Stock cannot be negative';
    if (!this.form.categoryId) errors['categoryId'] = 'Select a category';
    if (!this.form.imageUrl && !this.form.galleryImages.trim()) errors['images'] = 'Add at least one product image';
    this.validationErrors.set(errors);
    if (Object.keys(errors).length) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const editing = this.editingProduct();

    const payload = {
      ...this.form,
      galleryImages: JSON.stringify(this.toList(this.form.galleryImages)),
      availableColors: JSON.stringify(this.toList(this.form.availableColors)),
      availableSizes: JSON.stringify(this.toList(this.form.availableSizes)),
      discountPercentage: this.form.discountPercentage || 0,
      discountAmount: this.form.discountAmount || 0,
    };

    const request = editing
      ? this.api.putSecure<any>(
          `products/${editing.id}`,
          { ...payload, id: editing.id }
        )
      : this.api.postSecure<any>('products', payload);

    request.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.closeForm();
          this.loadData();
          this.successMessage.set(
            editing ? 'Product updated successfully!' : 'Product created successfully!'
          );
          setTimeout(() => this.successMessage.set(''), 3000);
        } else {
          this.errorMessage.set(res.message);
        }
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Error — please try again');
      }
    });
  }

  toggleProduct(product: Product): void {
    this.api.putSecure<any>(
      `admin/products/${product.id}/toggle`, {}
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.products.update(list =>
            list.map(p =>
              p.id === product.id
                ? { ...p, isActive: !p.isActive }
                : p
            )
          );
        }
      }
    });
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Delete "${product.name}"?`)) return;

    this.api.deleteSecure<any>(`products/${product.id}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.products.update(list =>
            list.filter(p => p.id !== product.id)
          );
          this.successMessage.set('Product deleted successfully!');
          setTimeout(() => this.successMessage.set(''), 3000);
        }
      }
    });
  }

  formatPrice(price: number): string {
    return this.config.formatPrice(price);
  }

  getCategoryName(id: number): string {
    return this.categories().find(c => c.id === id)?.name ?? '';
  }

  get discountPreview(): number {
    return Math.round(this.form.price * (this.form.discountPercentage / 100));
  }

  fieldError(field: string): string { return this.validationErrors()[field] || ''; }

  clearFieldError(field: string): void {
    if (!this.validationErrors()[field]) return;
    const errors = { ...this.validationErrors() };
    delete errors[field];
    this.validationErrors.set(errors);
  }

  private setFieldError(field: string, message: string): void {
    this.validationErrors.set({ ...this.validationErrors(), [field]: message });
  }

  imageCount(product: Product): number {
    return [product.imageUrl, ...this.toList(this.toCsv(product.galleryImages))]
      .filter((url, index, all) => url && all.indexOf(url) === index).length;
  }

  toList(value: string): string[] {
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }

  private toCsv(value: string[] | string | undefined): string {
    if (!value) return '';
    if (Array.isArray(value)) return value.join(', ');
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.join(', ') : value;
    } catch { return value; }
  }
}
