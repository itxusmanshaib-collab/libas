import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';


@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reviews.html',
  styleUrl: './admin-reviews.scss'
  
})
export class AdminReviewsComponent implements OnInit {

  private api = inject(ApiService);
  reviews = signal<any[]>([]);
  isLoading = signal(true);
  successMessage = signal('');

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.api.getSecure<any>('reviews/pending').subscribe({
      next: (res) => {
        if (res.success) this.reviews.set(res.data);
        this.isLoading.set(false);
      }
    });
  }

  approveReview(reviewId: number): void {
    this.api.putSecure<any>(`reviews/${reviewId}/approve`, {})
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.reviews.update(list =>
              list.filter(r => r.id !== reviewId)
            );
            this.successMessage.set('Review approved!');
            setTimeout(() => this.successMessage.set(''), 3000);
          }
        }
      });
  }

  deleteReview(reviewId: number): void {
    this.api.deleteSecure<any>(`reviews/${reviewId}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.reviews.update(list =>
            list.filter(r => r.id !== reviewId)
          );
          this.successMessage.set('Review deleted!');
          setTimeout(() => this.successMessage.set(''), 3000);
        }
      }
    });
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}