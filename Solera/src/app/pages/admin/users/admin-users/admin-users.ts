import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { CustomDropdownComponent, DropdownOption } from '../../../../shared/components/custom-dropdown/custom-dropdown';


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
  imports: [CommonModule, CustomDropdownComponent],
  templateUrl: './admin-users.html',
})
export class AdminUsersComponent implements OnInit {

  private api = inject(ApiService);
  users = signal<AdminUser[]>([]);
  isLoading = signal(true);
  successMessage = signal('');

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