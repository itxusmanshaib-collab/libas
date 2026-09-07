import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-admin-why-choose-us',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-why-choose-us.html',
})
export class AdminWhyChooseUsComponent implements OnInit {
  private api = inject(ApiService);
  items = signal<any[]>([]);
  isLoading = signal(true);
  showForm = signal(false);
  isSubmitting = signal(false);
  successMessage = signal('');
  editingId = signal<number | null>(null);

  form = {
    title: '',
    description: '',
    icon: '',
    displayOrder: 1,
    isActive: true,
  };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getSecure<any>('whychooseus/all').subscribe({
      next: (res) => { if (res.success) this.items.set(res.data); this.isLoading.set(false); }
    });
  }

  openAdd(): void {
    this.editingId.set(null);
    this.form = { title: '', description: '', icon: '', displayOrder: 1, isActive: true };
    this.showForm.set(true);
  }

  openEdit(item: any): void {
    this.editingId.set(item.id);
    this.form = { title: item.title, description: item.description, icon: item.icon, displayOrder: item.displayOrder, isActive: item.isActive };
    this.showForm.set(true);
  }

  save(): void {
    if (!this.form.title || !this.form.description) return;
    this.isSubmitting.set(true);

    const req = this.editingId()
      ? this.api.putSecure<any>(`whychooseus/${this.editingId()}`, this.form)
      : this.api.postSecure<any>('whychooseus', this.form);

    req.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) { this.showForm.set(false); this.load(); this.successMessage.set(this.editingId() ? 'Updated!' : 'Created!'); setTimeout(() => this.successMessage.set(''), 3000); }
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  toggle(id: number): void {
    this.api.putSecure<any>(`whychooseus/${id}/toggle`, {}).subscribe({
      next: (res) => { if (res.success) this.load(); }
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this item?')) return;
    this.api.deleteSecure<any>(`whychooseus/${id}`).subscribe({
      next: () => { this.load(); this.successMessage.set('Deleted!'); setTimeout(() => this.successMessage.set(''), 3000); }
    });
  }
}
