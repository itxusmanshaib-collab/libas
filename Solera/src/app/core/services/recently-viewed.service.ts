import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'libas_junior_recently_viewed';
const MAX_ITEMS = 8;

@Injectable({
  providedIn: 'root'
})
export class RecentlyViewedService {
  private _productIds = signal<number[]>(this.readIds());

  readonly productIds = this._productIds.asReadonly();

  add(productId: number): void {
    const ids = [productId, ...this._productIds().filter(id => id !== productId)].slice(0, MAX_ITEMS);
    this._productIds.set(ids);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  clear(): void {
    this._productIds.set([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  private readIds(): number[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const ids = stored ? JSON.parse(stored) : [];
      return Array.isArray(ids) ? ids.filter(id => Number.isInteger(id)).slice(0, MAX_ITEMS) : [];
    } catch {
      return [];
    }
  }
}
