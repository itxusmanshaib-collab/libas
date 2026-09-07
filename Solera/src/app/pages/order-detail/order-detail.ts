import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { AppConfigService } from '../../core/services/app-config.service';
import { ImageService } from '../../core/services/image.service';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.scss']
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private profileService = inject(ProfileService);
  config = inject(AppConfigService);
  private imageService = inject(ImageService);

  order = signal<Order | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  isCancelling = signal(false);
  cancelError = signal('');

  // Normal flow ke stages — Cancelled alag terminal state hai
  steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];

  currentStepIndex = computed(() => {
    const status = this.order()?.status;
    if (!status) return -1;
    return this.steps.indexOf(status);
  });

  isCancelled = computed(() => this.order()?.status === 'Cancelled');
  canCancel = computed(() => this.order()?.status === 'Pending');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/my-orders']);
      return;
    }
    this.loadOrder(id);
  }

  loadOrder(id: number): void {
    this.isLoading.set(true);
    this.profileService.getOrderDetail(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.order.set(res.data);
        } else {
          this.errorMessage.set('Order not found');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load order');
        this.isLoading.set(false);
      }
    });
  }

  cancelOrder(): void {
    const order = this.order();
    if (!order) return;
    if (!confirm('Are you sure you want to cancel this order?')) return;

    this.isCancelling.set(true);
    this.cancelError.set('');

    this.profileService.cancelOrder(order.id).subscribe({
      next: (res) => {
        this.isCancelling.set(false);
        if (res.success) {
          this.order.update(o => o ? { ...o, status: 'Cancelled' } : o);
        } else {
          this.cancelError.set(res.message || 'Cancellation failed');
        }
      },
      error: (err) => {
        this.isCancelling.set(false);
        this.cancelError.set(err?.error?.message || 'Something went wrong');
      }
    });
  }

  formatPrice(price: number): string {
    return this.config.formatPrice(price);
  }

  getImageUrl(path: string): string {
    return this.imageService.getImageUrl(path);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}