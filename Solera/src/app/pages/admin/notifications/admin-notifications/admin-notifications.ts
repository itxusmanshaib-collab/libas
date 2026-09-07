import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-notifications.html',
  styleUrls: ['./admin-notifications.scss']
})
export class AdminNotificationsComponent implements OnInit {

  private api = inject(ApiService);
  notifications = signal<any[]>([]);
  showForm = signal(false);
  isSubmitting = signal(false);
  successMessage = signal('');

  form = {
    message: '',
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]
  };

  ngOnInit(): void {
    this.api.getSecure<any>('notifications').subscribe({
      next: (res) => {
        if (res.success) this.notifications.set(res.data);
      }
    });
  }

  addNotification(): void {
    if (!this.form.message) return;
    this.isSubmitting.set(true);

    this.api.postSecure<any>('notifications', {
      ...this.form,
      startDate: new Date(this.form.startDate).toISOString(),
      endDate: new Date(this.form.endDate).toISOString()
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.showForm.set(false);
          this.notifications.update(list => [res.data, ...list]);
          this.successMessage.set('Notification ban gayi!');
          setTimeout(() => this.successMessage.set(''), 3000);
        }
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  deleteNotification(id: number): void {
    this.api.deleteSecure<any>(`notifications/${id}`).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.filter(n => n.id !== id)
        );
      }
    });
  }
}