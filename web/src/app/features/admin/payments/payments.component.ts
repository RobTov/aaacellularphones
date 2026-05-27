import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Payment } from '../../../shared/models/payment.model';

@Component({
  selector: 'app-admin-payments',
  standalone: false,
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Payments</h1>

      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-6 py-3 font-medium text-gray-500">ID</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Order</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Amount</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Currency</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of payments" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-mono text-xs text-gray-900">{{ p.id | slice:0:8 }}...</td>
                <td class="px-6 py-4 font-mono text-xs">{{ p.order_id | slice:0:8 }}...</td>
                <td class="px-6 py-4 font-medium">\${{ p.amount.toFixed(2) }}</td>
                <td class="px-6 py-4 uppercase text-xs">{{ p.currency }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex px-2.5 py-0.5 text-xs font-medium text-white rounded-full"
                        [style.background]="p.status === 'completed' ? '#22c55e' : p.status === 'failed' ? '#ef4444' : '#f59e0b'">
                    {{ p.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-500 text-xs">{{ p.created_at | date }}</td>
              </tr>
              <tr *ngIf="payments.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-400">No payments found.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <span class="text-sm text-gray-500">Total: {{ total }}</span>
          <div class="flex gap-2">
            <button (click)="load(currentPage - 1)" [disabled]="currentPage <= 1"
                    class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <button (click)="load(currentPage + 1)" [disabled]="payments.length < 20"
                    class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  total = 0;
  currentPage = 1;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load(1);
  }

  load(page: number): void {
    this.currentPage = page;
    this.api.get<{ success: boolean; data: Payment[]; total: number }>('/admin/orders?page=' + page).subscribe({
      next: r => {
        this.payments = [];
        this.total = r.total || 0;
        this.cdr.detectChanges();
      },
    });
  }
}
