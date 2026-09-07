import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { CustomDropdownComponent, DropdownOption } from '../../../../shared/components/custom-dropdown/custom-dropdown';

@Component({
  selector: 'app-admin-testimonials',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDropdownComponent],
  templateUrl: './admin-testimonials.html',
})
export class AdminTestimonialsComponent implements OnInit {
  private api = inject(ApiService);
  testimonials = signal<any[]>([]);
  isLoading = signal(true);
  showForm = signal(false);
  isSubmitting = signal(false);
  successMessage = signal('');
  editingId = signal<number | null>(null);

  form = {
    customerName: '',
    customerRole: '',
    content: '',
    rating: 5,
    imageUrl: '',
    displayOrder: 1,
  };

  roleOptions: DropdownOption[] = [
    { label: 'Select role', value: '' },
    { label: 'Regular Customer', value: 'Regular Customer' },
    { label: 'Beauty Blogger', value: 'Beauty Blogger' },
    { label: 'Loyal Customer', value: 'Loyal Customer' },
  ];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getSecure<any>('testimonials/all').subscribe({
      next: (res) => { if (res.success) this.testimonials.set(res.data); this.isLoading.set(false); }
    });
  }

  openAdd(): void {
    this.editingId.set(null);
    this.form = { customerName: '', customerRole: '', content: '', rating: 5, imageUrl: '', displayOrder: 1 };
    this.showForm.set(true);
  }

  openEdit(t: any): void {
    this.editingId.set(t.id);
    this.form = { customerName: t.customerName, customerRole: t.customerRole, content: t.content, rating: t.rating, imageUrl: t.imageUrl, displayOrder: t.displayOrder };
    this.showForm.set(true);
  }

  save(): void {
    if (!this.form.customerName || !this.form.content) return;
    this.isSubmitting.set(true);

    const req = this.editingId()
      ? this.api.putSecure<any>(`testimonials/${this.editingId()}`, this.form)
      : this.api.postSecure<any>('testimonials', this.form);

    req.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) { this.showForm.set(false); this.load(); this.successMessage.set(this.editingId() ? 'Updated!' : 'Created!'); setTimeout(() => this.successMessage.set(''), 3000); }
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  toggle(id: number): void {
    this.api.putSecure<any>(`testimonials/${id}/toggle`, {}).subscribe({
      next: (res) => { if (res.success) this.load(); }
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this testimonial?')) return;
    this.api.deleteSecure<any>(`testimonials/${id}`).subscribe({
      next: () => { this.load(); this.successMessage.set('Deleted!'); setTimeout(() => this.successMessage.set(''), 3000); }
    });
  }
}
