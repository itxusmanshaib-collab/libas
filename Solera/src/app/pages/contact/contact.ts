import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppConfigService } from '../../core/services/app-config.service';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss']
})
export class Contact {
  private readonly apiUrl = environment.apiUrl;
  config = inject(AppConfigService);
  private http = inject(HttpClient);

  // Form fields
  fullName = signal('');
  email = signal('');
  subject = signal('');
  message = signal('');

  // UI state
  isSending = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  faqs = signal<FaqItem[]>([
    {
      question: 'How long does delivery take?',
      answer: 'Orders within Pakistan typically arrive within 3-5 business days. You\'ll receive a tracking link once your order ships.',
      open: false
    },
    {
      question: 'Do you offer free delivery?',
      answer: 'Yes! Free delivery is available on all orders above Rs. 2,500 anywhere in Pakistan.',
      open: false
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a hassle-free 7-day return policy on unused, unopened products. Visit our Terms page for full details.',
      open: false
    },
    {
      question: 'Are your products suitable for sensitive skin?',
      answer: 'Most of our formulations are dermatologist-tested and free from harsh chemicals, making them suitable for sensitive skin. Check individual product descriptions for specific ingredients.',
      open: false
    }
  ]);

  toggleFaq(index: number): void {
    this.faqs.update(list =>
      list.map((f, i) => i === index ? { ...f, open: !f.open } : f)
    );
  }

  private validate(): string | null {
    if (!this.fullName().trim()) return 'Please enter your name';
    if (!this.email().trim()) return 'Please enter your email';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email().trim())) return 'Please enter a valid email address';

    if (!this.subject().trim()) return 'Please enter a subject';
    if (!this.message().trim() || this.message().trim().length < 10) {
      return 'Message should be at least 10 characters long';
    }
    return null;
  }

  sendMessage(): void {
    this.successMessage.set('');
    // this.errorMessage.set();

    const validationError = this.validate();
    if (validationError) {
      this.errorMessage.set(validationError);
      return;
    }

    this.isSending.set(true);

    const payload = {
      from_name: this.fullName().trim(),
      from_email: this.email().trim(),
      subject: this.subject().trim(),
      message: this.message().trim()
    };

    this.http.post(`${this.apiUrl}/contactus`, payload).subscribe({
      next: () => {
        this.isSending.set(false);
        this.successMessage.set('Thank you! Your message has been sent — we\'ll get back to you within 24 hours.');
        this.fullName.set('');
        this.email.set('');
        this.subject.set('');
        this.message.set('');
      },
      error: () => {
        this.isSending.set(false);
        this.errorMessage.set('Something went wrong. Please try again or reach us on WhatsApp.');
      }
    });
  }
}