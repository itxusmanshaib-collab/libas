import { Injectable, signal } from '@angular/core';
import { Observable, Subject, take } from 'rxjs';

export interface ConfirmDialogState {
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AdminConfirmService {
  readonly dialog = signal<ConfirmDialogState | null>(null);
  private result$?: Subject<boolean>;

  confirm(message: string, title = 'Delete Confirmation'): Observable<boolean> {
    this.result$?.complete();
    this.result$ = new Subject<boolean>();
    this.dialog.set({ title, message });
    return this.result$.asObservable().pipe(take(1));
  }

  respond(result: boolean): void {
    this.dialog.set(null);
    this.result$?.next(result);
    this.result$?.complete();
    this.result$ = undefined;
  }
}
