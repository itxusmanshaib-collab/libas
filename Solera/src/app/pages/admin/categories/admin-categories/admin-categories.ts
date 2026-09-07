import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.html',
})
export class AdminCategoriesComponent implements OnInit {

  private api = inject(ApiService);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  showForm = signal(false);
  isSubmitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  editingCategory = signal<Category | null>(null);

  form = { name: '', description: '', imageUrl: '' };

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.api.get<any>('categories').subscribe({
      next: (res) => {
        if (res.success) this.categories.set(res.data);
        this.isLoading.set(false);
      }
    });
  }

  openAddForm(): void {
    this.editingCategory.set(null);
    this.form = { name: '', description: '', imageUrl: '' };
    this.showForm.set(true);
  }

  openEditForm(cat: Category): void {
    this.editingCategory.set(cat);
    this.form = {
      name: cat.name,
      description: cat.description,
      imageUrl: cat.imageUrl
    };
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.errorMessage.set('');
  }

  saveCategory(): void {
    if (!this.form.name) {
      this.errorMessage.set('Category name is required');
      return;
    }

    this.isSubmitting.set(true);
    const editing = this.editingCategory();

    const req = editing
      ? this.api.putSecure<any>(`categories/${editing.id}`, this.form)
      : this.api.postSecure<any>('categories', this.form);

    req.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.closeForm();
          this.loadCategories();
          this.successMessage.set(
            editing ? 'Category updated successfully!' : 'Category created successfully!'
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

  deleteCategory(cat: Category): void {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    this.api.deleteSecure<any>(`categories/${cat.id}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.categories.update(list =>
            list.filter(c => c.id !== cat.id)
          );
          this.successMessage.set('Category delete ho gayi!');
          setTimeout(() => this.successMessage.set(''), 3000);
        }
      }
    });
  }
}