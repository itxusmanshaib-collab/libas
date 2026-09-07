import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'libas_junior_wishlist';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private _productIds = signal<number[]>(this.readIds());

  readonly productIds = this._productIds.asReadonly();
  readonly count = () => this._productIds().length;

  has(productId: number): boolean {
    return this._productIds().includes(productId);
  }

  toggle(productId: number): boolean {
    const ids = this.has(productId)
      ? this._productIds().filter(id => id !== productId)
      : [...this._productIds(), productId];

    this._productIds.set(ids);
    this.persist(ids);
    return ids.includes(productId);
  }

  remove(productId: number): void {
    if (this.has(productId)) this.toggle(productId);
  }

  clear(): void {
    this._productIds.set([]);
    this.persist([]);
  }

  private readIds(): number[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const ids = stored ? JSON.parse(stored) : [];
      return Array.isArray(ids) ? ids.filter(id => Number.isInteger(id)) : [];
    } catch {
      return [];
    }
  }

  private persist(ids: number[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
}
