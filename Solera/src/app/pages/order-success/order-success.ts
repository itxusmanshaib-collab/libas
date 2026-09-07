import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-success',
  imports: [RouterLink],
  template: `
    <div class="order-success-page">
      <div class="success-card">
        <div class="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for your order. You will receive a confirmation shortly.</p>
        <div class="success-actions">
          <a routerLink="/profile/orders" class="btn-primary">View My Orders</a>
          <a routerLink="/products" class="btn-secondary">Continue Shopping</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .order-success-page {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f7f5;
      padding: 40px 20px;
    }
    .success-card {
      background: #fff;
      border-radius: 16px;
      padding: 48px;
      text-align: center;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .success-icon { margin-bottom: 24px; }
    h1 { font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; }
    p { color: #666; font-size: 15px; margin-bottom: 32px; }
    .success-actions { display: flex; flex-direction: column; gap: 12px; }
    .btn-primary {
      display: block; padding: 12px 24px; background: #1a1a1a; color: #fff;
      border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none; text-align: center;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #333; }
    .btn-secondary {
      display: block; padding: 12px 24px; background: transparent; color: #1a1a1a;
      border: 1px solid #e8e8e6; border-radius: 10px; font-size: 14px; font-weight: 600;
      text-decoration: none; text-align: center; transition: background 0.2s;
    }
    .btn-secondary:hover { background: #f5f5f3; }
  `]
})
export class OrderSuccessComponent {}
