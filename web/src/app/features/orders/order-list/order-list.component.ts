import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: false,
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>

      <div *ngIf="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="!loading && orders.length === 0" class="text-center py-16">
        <app-icon name="receipt_long" size="56px" class="text-gray-300"></app-icon>
        <p class="text-gray-500 mt-4 mb-6">No orders yet.</p>
        <a routerLink="/products" class="inline-flex px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          Start Shopping
        </a>
      </div>

      <div class="space-y-3" *ngIf="!loading && orders.length > 0">
        <div *ngFor="let o of orders" [routerLink]="['/orders', o.id]"
             class="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-gray-900">Order #{{ o.id | slice:0:8 }}...</p>
              <p class="text-sm text-gray-500 mt-0.5">{{ o.created_at | date:'medium' }}</p>
            </div>
            <div class="text-right">
              <span class="inline-flex px-3 py-1 text-xs font-medium text-white rounded-full"
                    [style.background]="statusColor(o.status)">
                {{ o.status }}
              </span>
              <p class="font-bold text-gray-900 mt-1.5">\${{ o.total_amount.toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.api.get<Order[]>('/orders').subscribe({
      next: r => {
        this.orders = r;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  statusColor(s: string): string {
    const map: Record<string, string> = {
      pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6',
      shipped: '#6366f1', delivered: '#22c55e', cancelled: '#ef4444',
    };
    return map[s] || '#94a3b8';
  }
}
