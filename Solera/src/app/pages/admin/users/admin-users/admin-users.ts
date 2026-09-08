import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { CustomDropdownComponent, DropdownOption } from '../../../../shared/components/custom-dropdown/custom-dropdown';
import { AdminTableFooterComponent } from '../../../../shared/components/admin-table-footer/admin-table-footer';


interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  orderCount: number;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, CustomDropdownComponent, AdminTableFooterComponent],
  templateUrl: './admin-users.html',
})
export class AdminUsersComponent implements OnInit {

  private api = inject(ApiService);
  users = signal<AdminUser[]>([]);
  isLoading = signal(true);
  successMessage = signal('');
  searchTerm = signal('');
  pageSize = signal(10);
  currentPage = signal(1);

  filteredUsers = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    return this.users().filter(user =>
      !query || `${user.fullName} ${user.email} ${user.role}`.toLowerCase().includes(query)
    );
  });

  pagedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredUsers().slice(start, start + this.pageSize());
  });

  roleOptions: DropdownOption[] = [
    { label: 'User', value: 'User' },
    { label: 'Admin', value: 'Admin' },
  ];

  ngOnInit(): void {
    this.api.getSecure<any>('admin/users').subscribe({
      next: (res) => {
        if (res.success) this.users.set(res.data);
        this.isLoading.set(false);
      }
    });
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  updatePageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  changeRole(user: AdminUser, role: string): void {
    this.api.putSecure<any>(
      `admin/users/${user.id}/role`,
      JSON.stringify(role)
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.users.update(list =>
            list.map(u => u.id === user.id ? { ...u, role } : u)
          );
          this.successMessage.set(`${user.fullName}'s role updated to ${role}`);
          setTimeout(() => this.successMessage.set(''), 3000);
        }
      }
    });
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}