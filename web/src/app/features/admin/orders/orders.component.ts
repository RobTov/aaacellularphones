import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Order, OrderStatus } from '../../../shared/models/order.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-orders',
  standalone: false,
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Orders</h1>

      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-6 py-3 font-medium text-gray-500">ID</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Customer</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Total</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let o of orders" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-900">{{ o.id | slice:0:8 }}...</td>
                <td class="px-6 py-4 text-gray-600">{{ o.user?.email || o.user_id | slice:0:8 }}</td>
                <td class="px-6 py-4 font-medium">\${{ o.total_amount.toFixed(2) }}</td>
                <td class="px-6 py-4">
                  <select [value]="o.status" (change)="updateStatus(o, $event)"
                          class="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                    <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
                  </select>
                </td>
                <td class="px-6 py-4 text-gray-500 text-xs">{{ o.created_at | date:'short' }}</td>
              </tr>
              <tr *ngIf="orders.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-400">No orders found.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <span class="text-sm text-gray-500">Total: {{ total }}</span>
          <div class="flex gap-2">
            <button (click)="load(currentPage - 1)" [disabled]="currentPage <= 1"
                    class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <button (click)="load(currentPage + 1)" [disabled]="orders.length < 20"
                    class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  total = 0;
  currentPage = 1;
  statuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load(1);
  }

  load(page: number): void {
    this.currentPage = page;
    this.api.getPaginated<Order>('/admin/orders', { page }).subscribe({
      next: r => {
        this.orders = r.data;
        this.total = r.total;
        this.cdr.detectChanges();
      },
    });
  }

  updateStatus(o: Order, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as OrderStatus;
    this.api.put('/admin/orders/' + o.id + '/status', { status }).subscribe({
      next: () => {
        o.status = status;
        this.toast.success('Order status updated.');
        this.cdr.detectChanges();
      },
    });
  }
}
