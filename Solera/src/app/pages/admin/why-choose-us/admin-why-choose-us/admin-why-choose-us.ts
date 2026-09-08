import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { AdminTableFooterComponent } from '../../../../shared/components/admin-table-footer/admin-table-footer';
import { AdminConfirmService } from '../../../../core/services/admin-confirm.service';

@Component({
  selector: 'app-admin-why-choose-us',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminTableFooterComponent],
  templateUrl: './admin-why-choose-us.html',
})
export class AdminWhyChooseUsComponent implements OnInit {
  private api = inject(ApiService);
  private confirm = inject(AdminConfirmService);
  items = signal<any[]>([]);
  isLoading = signal(true);
  showForm = signal(false);
  isSubmitting = signal(false);
  successMessage = signal('');
  editingId = signal<number | null>(null);
  searchTerm = signal('');
  pageSize = signal(10);
  currentPage = signal(1);
  filteredItems = computed(() => { const query = this.searchTerm().trim().toLowerCase(); return this.items().filter(item => !query || `${item.title} ${item.description} ${item.icon}`.toLowerCase().includes(query)); });
  pagedItems = computed(() => this.filteredItems().slice((this.currentPage() - 1) * this.pageSize(), this.currentPage() * this.pageSize()));
  updateSearch(value: string): void { this.searchTerm.set(value); this.currentPage.set(1); }
  updatePageSize(size: number): void { this.pageSize.set(size); this.currentPage.set(1); }

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
    this.confirm.confirm('Are you sure you want to delete this item?').subscribe(confirmed => {
      if (!confirmed) return;
      this.api.deleteSecure<any>(`whychooseus/${id}`).subscribe({
      next: () => { this.load(); this.successMessage.set('Deleted!'); setTimeout(() => this.successMessage.set(''), 3000); }
      });
    });
  }
}
