import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { ImageService } from '../../../../core/services/image.service';

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-banners.html',
  styleUrls: ['./admin-banners.scss']
})
export class AdminBannersComponent implements OnInit {

  private api = inject(ApiService);
  imageService = inject(ImageService);
  banners = signal<any[]>([]);
  isLoading = signal(true);
  showForm = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  isSubmitting = signal(false);
  uploadingImage = signal(false);

  form = {
    title: '',
    subTitle: '',
    imageUrl: '',
    linkUrl: '/products',
    buttonText: 'Shop Now',
    displayOrder: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]
  };

  ngOnInit(): void {
    this.loadBanners();
  }

  loadBanners(): void {
    this.api.getSecure<any>('banners/all').subscribe({
      next: (res) => {
        if (res.success) this.banners.set(res.data);
        this.isLoading.set(false);
      }
    });
  }

  uploadImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);

    this.uploadingImage.set(true);

    this.api.postSecureFormData<any>('uploads/image', formData).subscribe({
      next: (res) => {
        this.uploadingImage.set(false);
        if (res.success && res.data) {
          this.form.imageUrl = typeof res.data === 'string' ? res.data : res.data.url || res.data.imageUrl || '';
        }
      },
      error: () => {
        this.uploadingImage.set(false);
      }
    });
  }

  addBanner(): void {
    this.errorMessage.set('');

    if (!this.form.title.trim()) {
      this.errorMessage.set('Title is required');
      return;
    }
    if (!this.form.subTitle.trim()) {
      this.errorMessage.set('Subtitle is required');
      return;
    }
    if (!this.form.buttonText.trim()) {
      this.errorMessage.set('Button text is required');
      return;
    }

    this.isSubmitting.set(true);

    this.api.postSecure<any>('banners', {
      ...this.form,
      startDate: new Date(this.form.startDate).toISOString(),
      endDate: new Date(this.form.endDate).toISOString()
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.showForm.set(false);
          this.loadBanners();
          this.successMessage.set('Banner created successfully!');
          setTimeout(() => this.successMessage.set(''), 3000);
        }
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  toggleBanner(id: number): void {
    this.api.putSecure<any>(`banners/${id}/toggle`, {}).subscribe({
      next: (res) => {
        if (res.success) {
          this.banners.update(list =>
            list.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b)
          );
        }
      }
    });
  }

  deleteBanner(id: number): void {
    if (!confirm('Delete this banner?')) return;
    this.api.deleteSecure<any>(`banners/${id}`).subscribe({
      next: () => {
        this.banners.update(list => list.filter(b => b.id !== id));
        this.successMessage.set('Banner deleted successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      }
    });
  }
}
