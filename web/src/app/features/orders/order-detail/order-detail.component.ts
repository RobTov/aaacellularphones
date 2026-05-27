import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: false,
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8" *ngIf="order">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Order Detail</h1>

      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Order #{{ order.id }}</p>
            <p class="text-sm text-gray-500 mt-0.5">{{ order.created_at | date:'medium' }}</p>
          </div>
          <span class="inline-flex px-3 py-1 text-xs font-medium text-white rounded-full"
                [style.background]="statusColor(order.status)">
            {{ order.status }}
          </span>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h3 class="font-semibold text-gray-900 mb-4">Items</h3>
        <div class="space-y-3">
          <div *ngFor="let item of order.items" class="flex items-center gap-4 py-2">
            <img [src]="item.product_image || 'assets/placeholder.svg'"
                 class="w-14 h-14 object-cover rounded-lg flex-shrink-0">
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900">{{ item.product_name }}</p>
              <p class="text-sm text-gray-500">{{ item.quantity }} x \${{ item.unit_price.toFixed(2) }}</p>
            </div>
            <p class="font-semibold text-gray-900">\${{ item.total_price.toFixed(2) }}</p>
          </div>
        </div>
        <div class="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
          <span class="text-lg font-semibold text-gray-900">Total</span>
          <span class="text-xl font-bold text-blue-600">\${{ order.total_amount.toFixed(2) }}</span>
        </div>
      </div>

      <div *ngIf="order.payment" class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Payment</h3>
        <dl class="space-y-3">
          <div class="flex justify-between">
            <dt class="text-sm text-gray-500">Status</dt>
            <dd class="text-sm font-medium text-gray-900">{{ order.payment.status }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-gray-500">Amount</dt>
            <dd class="text-sm font-medium text-gray-900">\${{ order.payment.amount.toFixed(2) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-gray-500">Currency</dt>
            <dd class="text-sm font-medium text-gray-900 uppercase">{{ order.payment.currency }}</dd>
          </div>
        </dl>
      </div>
    </div>
  `,
})
export class OrderDetailComponent implements OnInit {
  order?: Order;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.get<Order>('/orders/' + id).subscribe({
      next: r => {
        this.order = r;
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
