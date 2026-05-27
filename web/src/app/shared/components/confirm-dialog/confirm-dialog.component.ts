import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  template: `
    <div *ngIf="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" (click)="cancel.emit()"></div>
      <div class="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h2>
        <p class="text-sm text-gray-600 mb-6">{{ message }}</p>
        <div class="flex justify-end gap-3">
          <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" (click)="cancel.emit()">
            Cancel
          </button>
          <button class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors" (click)="confirm.emit()">
            Confirm
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
