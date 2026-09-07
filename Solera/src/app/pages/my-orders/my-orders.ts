import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { AppConfigService } from '../../core/services/app-config.service';
import { ImageService } from '../../core/services/image.service';
import { Order } from '../../core/models/order.model';

type StatusFilter = 'All' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.html',
  styleUrls: ['./my-orders.scss']
})
export class MyOrdersComponent implements OnInit {
  private profileService = inject(ProfileService);
  config = inject(AppConfigService);
  private imageService = inject(ImageService);

  orders = signal<Order[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  activeFilter = signal<StatusFilter>('All');

  filteredOrders = computed(() => {
    const filter = this.activeFilter();
    const all = this.orders();
    if (filter === 'All') return all;
    return all.filter(o => o.status === filter);
  });

  filters: StatusFilter[] = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.profileService.getMyOrders().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.orders.set([...res.data].sort((a, b) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          ));
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load orders');
        this.isLoading.set(false);
      }
    });
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);
  }

  formatPrice(price: number): string {
    return this.config.formatPrice(price);
  }

  getImageUrl(path: string): string {
    return this.imageService.getImageUrl(path);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  statusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }
}