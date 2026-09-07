import { Component, Input, Output, EventEmitter, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownOption {
  label: string;
  value: any;
  disabled?: boolean;
}

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cd-wrap" [class.cd-open]="isOpen()" [class.cd-disabled]="disabled" [class.cd-sm]="size === 'sm'" [class.cd-lg]="size === 'lg'">
      <button
        class="cd-trigger"
        (click)="toggle()"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-haspopup]="true"
        [disabled]="disabled">
        <span class="cd-value" [class.cd-placeholder]="!selectedLabel">
          {{ selectedLabel || placeholder }}
        </span>
        <svg class="cd-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      @if (isOpen()) {
        <div class="cd-panel" role="listbox">
          @for (option of options; track option.value) {
            <button
              class="cd-option"
              [class.cd-option-active]="option.value === modelValue"
              [class.cd-option-disabled]="option.disabled"
              (click)="select(option, $event)"
              [disabled]="option.disabled"
              role="option"
              [attr.aria-selected]="option.value === modelValue">
              <span class="cd-option-label">{{ option.label }}</span>
              @if (option.value === modelValue) {
                <svg class="cd-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './custom-dropdown.scss'
})
export class CustomDropdownComponent {
  @Input() options: DropdownOption[] = [];
  @Input() modelValue: any = null;
  @Input() placeholder = 'Select...';
  @Input() disabled = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() modelValueChange = new EventEmitter<any>();

  isOpen = signal(false);

  get selectedLabel(): string {
    const found = this.options.find(o => o.value === this.modelValue);
    return found ? found.label : '';
  }

  toggle(): void {
    if (this.disabled) return;
    this.isOpen.update(v => !v);
  }

  select(option: DropdownOption, event: Event): void {
    event.stopPropagation();
    if (option.disabled) return;
    this.modelValue = option.value;
    this.modelValueChange.emit(option.value);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.cd-wrap')) {
      this.isOpen.set(false);
    }
  }
}