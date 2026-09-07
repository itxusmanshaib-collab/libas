import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppConfigService } from '../../../../core/services/app-config.service';
import { ApiService } from '../../../../core/services/api.service';
import { CustomDropdownComponent, DropdownOption } from '../../../../shared/components/custom-dropdown/custom-dropdown';


interface Order {
  id: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  deliveryAddress: string;
  phoneNumber?: string;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  user: { fullName: string; email: string };
  items: any[];
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDropdownComponent],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss'
})
export class AdminOrdersComponent implements OnInit {

  private api = inject(ApiService);
  config = inject(AppConfigService);
  private router = inject(Router);

  orders = signal<Order[]>([]);
  isLoading = signal(true);
  updatingOrderId = signal<number | null>(null);
  filterStatus = signal('All');
  successMessage = signal('');

  statuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  statusOptions: DropdownOption[] = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  filteredOrders = () => {
    const status = this.filterStatus();
    if (status === 'All') return this.orders();
    return this.orders().filter(o => o.status === status);
  };

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.api.getSecure<any>('admin/orders').subscribe({
      next: (res) => {
        if (res.success) this.orders.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  updateStatus(orderId: number, status: string): void {
    this.updatingOrderId.set(orderId);

    this.api.putSecure<any>(
      `admin/orders/${orderId}/status`,
      JSON.stringify(status)
    ).subscribe({
      next: (res) => {
        this.updatingOrderId.set(null);
        if (res.success) {
          this.orders.update(orders =>
            orders.map(o =>
              o.id === orderId ? { ...o, status } : o
            )
          );
          this.successMessage.set(`Order #${orderId} status updated!`);
          setTimeout(() => this.successMessage.set(''), 3000);
        }
      },
      error: () => this.updatingOrderId.set(null)
    });
  }

  formatPrice(price: number): string {
    return this.config.formatPrice(price);
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      'Pending': '#e67e22', 'Processing': '#3498db',
      'Shipped': '#9b59b6', 'Delivered': '#27ae60', 'Cancelled': '#e74c3c'
    };
    return map[status] ?? '#888';
  }

  getStatusBg(status: string): string {
    const map: Record<string, string> = {
      'Pending': '#fff3e0', 'Processing': '#e8f4fd',
      'Shipped': '#f3e8ff', 'Delivered': '#f0fdf4', 'Cancelled': '#fef2f2'
    };
    return map[status] ?? '#f5f5f3';
  }

  navigateToDetail(orderId: number): void {
    this.router.navigate(['/order-detail', orderId]);
  }
}
