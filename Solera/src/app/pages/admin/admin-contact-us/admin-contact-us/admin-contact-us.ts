import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-admin-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-contact-us.html',
  styleUrls: ['./admin-contact-us.scss']
})
export class AdminContactUsComponent implements OnInit {

  private api = inject(ApiService);
  messages = signal<any[]>([]);
  isLoading = signal(true);
  successMessage = signal('');
  errorMessage = signal('');
  isSending = signal(false);
  deleting = signal(false);
  editingId = signal<number | null>(null);
  form = {
    fullName: '',
    email: '',
    subject: '',
    message: ''
  };

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.isLoading.set(true);
    this.api.getSecure<any>('contactus').subscribe({
      next: (res) => {
        // API returns { success: boolean, data: T, message: string }
        if (res && res.success && Array.isArray(res.data)) {
          this.messages.set(res.data);
        } else if (Array.isArray(res)) {
          this.messages.set(res);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Messages load nahi ho rahe');
        this.isLoading.set(false);
      }
    });
  }

  editMessage(id: number): void {
    this.editingId.set(id);
    const msg = this.messages().find(m => m.id === id);
    if (msg) {
      this.form = {
        fullName: msg.fullName,
        email: msg.email,
        subject: msg.subject,
        message: msg.message
      };
    }
  }

  closeForm(): void {
    this.editingId.set(null);
    this.form = {
      fullName: '',
      email: '',
      subject: '',
      message: ''
    };
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  deleteMessage(id: number): void {
    if (!confirm('Delete this message?')) return;
    this.deleting.set(true);
    this.api.deleteSecure<any>(`contactus/${id}`).subscribe({
      next: () => {
        this.messages.update(list => list.filter(m => m.id !== id));
        this.successMessage.set('Message delete ho gaya');
        setTimeout(() => this.successMessage.set(''), 3000);
        this.deleting.set(false);
      },
      error: () => {
        this.errorMessage.set('Delete fail');
        this.deleting.set(false);
      }
    });
  }
}