import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { AppConfigService } from '../../../../core/services/app-config.service';
import { AuthService } from '../../../../core/services/auth.service';


interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  user: { fullName: string; email: string };
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {

  private api = inject(ApiService);
  config = inject(AppConfigService);
  auth = inject(AuthService);

  stats = signal<DashboardStats | null>(null);
  recentOrders = signal<RecentOrder[]>([]);
  isLoading = signal(true);

  statusSummary = computed(() => {
    const orders = this.recentOrders();
    return [
      { label: 'Pending', value: orders.filter(order => order.status === 'Pending').length, color: '#d97706', background: '#fff7ed' },
      { label: 'Processing', value: orders.filter(order => order.status === 'Processing').length, color: '#2563eb', background: '#eff6ff' },
      { label: 'Shipped', value: orders.filter(order => order.status === 'Shipped').length, color: '#7c3aed', background: '#f5f3ff' },
      { label: 'Delivered', value: orders.filter(order => order.status === 'Delivered').length, color: '#15803d', background: '#f0fdf4' },
    ];
  });

  orderProgress = computed(() => {
    const total = this.recentOrders().length || 1;
    return this.statusSummary().map(item => ({
      ...item,
      width: `${Math.max(item.value / total * 100, item.value ? 8 : 0)}%`,
    }));
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);

    // Dashboard stats
    this.api.getSecure<any>('admin/dashboard').subscribe({
      next: (res) => {
        if (res.success) this.stats.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    // Recent orders
    this.api.getSecure<any>('admin/orders').subscribe({
      next: (res) => {
        if (res.success) {
          this.recentOrders.set(res.data.slice(0, 8));
        }
      }
    });
  }

  formatPrice(price: number): string {
    return this.config.formatPrice(price);
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      'Pending': '#e67e22',
      'Processing': '#3498db',
      'Shipped': '#9b59b6',
      'Delivered': '#27ae60',
      'Cancelled': '#e74c3c',
    };
    return map[status] ?? '#888';
  }

  getStatusBg(status: string): string {
    const map: Record<string, string> = {
      'Pending': '#fff3e0',
      'Processing': '#e8f4fd',
      'Shipped': '#f3e8ff',
      'Delivered': '#f0fdf4',
      'Cancelled': '#fef2f2',
    };
    return map[status] ?? '#f5f5f3';
  }
}