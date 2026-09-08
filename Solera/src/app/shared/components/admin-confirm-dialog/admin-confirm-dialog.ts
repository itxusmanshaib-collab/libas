import { Component, inject } from '@angular/core';
import { AdminConfirmService } from '../../../core/services/admin-confirm.service';

@Component({
  selector: 'app-admin-confirm-dialog',
  standalone: true,
  templateUrl: './admin-confirm-dialog.html',
  styleUrl: './admin-confirm-dialog.scss',
})
export class AdminConfirmDialogComponent {
  readonly confirm = inject(AdminConfirmService);
}
