import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-table-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-table-footer.html',
  styleUrl: './admin-table-footer.scss',
})
export class AdminTableFooterComponent {
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<number>();

  readonly pageSizes = [10, 20, 50, 100];

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get startItem(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get pages(): number[] {
    const last = this.totalPages;
    const first = Math.max(1, Math.min(this.currentPage - 2, last - 4));
    return Array.from({ length: Math.min(5, last) }, (_, index) => first + index);
  }

  setPageSize(value: string): void {
    this.pageSizeChange.emit(Number(value));
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
