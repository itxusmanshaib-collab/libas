import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AppConfigService } from '../../core/services/app-config.service';
import { ImageService } from '../../core/services/image.service';

interface OrderItem {
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

interface Order {
  orderId: number;
  status: string;
  totalAmount: number;
  orderDate: string;
  deliveryAddress: string;
  items: OrderItem[];
}

// Order status steps
const STATUS_STEPS = [
  { key: 'Pending',    label: 'Order Placed',    icon: '📋', desc: 'Your order has been received' },
  { key: 'Processing', label: 'Processing',       icon: '⚙️', desc: 'We are preparing your order' },
  { key: 'Shipped',   label: 'Shipped',           icon: '🚚', desc: 'Your order is on the way' },
  { key: 'Delivered', label: 'Delivered',         icon: '✅', desc: 'Order delivered successfully' },
];

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './track-order.html',
  styleUrls: ['./track-order.scss']
})
export class TrackOrder {

  private api = inject(ApiService);
  auth = inject(AuthService);
  config = inject(AppConfigService);
  private imageService = inject(ImageService);

  // Search
  orderId = '';

  // State
  isSearching = signal(false);
  order = signal<Order | null>(null);
  errorMessage = signal('');
  hasSearched = signal(false);

  // Status steps
  statusSteps = STATUS_STEPS;

  // Search order
  searchOrder(): void {
    if (!this.orderId.trim()) {
      this.errorMessage.set('Please enter an Order ID');
      return;
    }

    this.isSearching.set(true);
    this.errorMessage.set('');
    this.order.set(null);
    this.hasSearched.set(false);

    this.api.getSecure<any>(`orders/${this.orderId}`).subscribe({
      next: (res) => {
        this.isSearching.set(false);
        this.hasSearched.set(true);
        if (res.success && res.data) {
          this.order.set(res.data);
        } else {
          this.errorMessage.set('Order not found — please check the ID');
        }
      },
      error: (err) => {
        this.isSearching.set(false);
        this.hasSearched.set(true);
        if (err.status === 404) {
          this.errorMessage.set('Order not found — please check the ID');
        } else if (err.status === 403) {
          this.errorMessage.set('This order does not belong to you');
        } else {
          this.errorMessage.set('Something went wrong — please try again');
        }
      }
    });
  }

  // Current step index
  getCurrentStepIndex(): number {
    const status = this.order()?.status;
    if (!status || status === 'Cancelled') return -1;
    return STATUS_STEPS.findIndex(s => s.key === status);
  }

  // Step completed?
  isStepCompleted(index: number): boolean {
    return index < this.getCurrentStepIndex();
  }

  // Step active?
  isStepActive(index: number): boolean {
    return index === this.getCurrentStepIndex();
  }

  // Is cancelled?
  isCancelled(): boolean {
    return this.order()?.status === 'Cancelled';
  }

  // Format price
  formatPrice(price: number): string {
    return this.config.formatPrice(price);
  }

  getImageUrl(path: string): string {
    return this.imageService.getImageUrl(path);
  }

  // Status color
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'Pending': '#e67e22',
      'Processing': '#3498db',
      'Shipped': '#9b59b6',
      'Delivered': '#27ae60',
      'Cancelled': '#e74c3c',
    };
    return colors[status] ?? '#888';
  }

  // Status background
  getStatusBg(status: string): string {
    const bgs: Record<string, string> = {
      'Pending': '#fff3e0',
      'Processing': '#e8f4fd',
      'Shipped': '#f3e8ff',
      'Delivered': '#f0fdf4',
      'Cancelled': '#fef2f2',
    };
    return bgs[status] ?? '#f5f5f3';
  }
}