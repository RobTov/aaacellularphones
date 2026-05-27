import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p class="text-3xl font-bold text-blue-600">\${{ totalRevenue.toFixed(2) }}</p>
          <p class="text-sm text-gray-500 mt-1">Total Revenue</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p class="text-3xl font-bold text-blue-600">{{ totalOrders }}</p>
          <p class="text-sm text-gray-500 mt-1">Orders</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p class="text-3xl font-bold text-blue-600">{{ totalProducts }}</p>
          <p class="text-sm text-gray-500 mt-1">Products</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p class="text-3xl font-bold text-blue-600">{{ totalUsers }}</p>
          <p class="text-sm text-gray-500 mt-1">Users</p>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-6 py-3 font-medium text-gray-500">ID</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Customer</th>
                <th class="text-right px-6 py-3 font-medium text-gray-500">Amount</th>
                <th class="text-right px-6 py-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let o of recentOrders" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-900">{{ o.id | slice:0:8 }}...</td>
                <td class="px-6 py-4 text-gray-600">{{ o.user?.email || o.user_id | slice:0:8 }}</td>
                <td class="px-6 py-4 text-right font-medium">\${{ o.total_amount.toFixed(2) }}</td>
                <td class="px-6 py-4 text-right">
                  <span class="inline-flex px-2.5 py-0.5 text-xs font-medium text-white rounded-full"
                        [style.background]="o.status === 'delivered' ? '#22c55e' : o.status === 'cancelled' ? '#ef4444' : '#f59e0b'">
                    {{ o.status }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="recentOrders.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-gray-400">No orders yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  totalRevenue = 0;
  totalOrders = 0;
  totalProducts = 0;
  totalUsers = 0;
  recentOrders: Order[] = [];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.api.getPaginated<Order>('/admin/orders', { limit: 5 }).subscribe({
      next: r => {
        this.recentOrders = r.data;
        this.totalOrders = r.total;
        this.totalRevenue = r.data.filter(o => o.status === 'delivered' || o.status === 'confirmed')
          .reduce((s, o) => s + o.total_amount, 0);
        this.cdr.detectChanges();
      },
    });
    this.api.getPaginated<any>('/products', { limit: 1 }).subscribe(r => {
      this.totalProducts = r.total;
      this.cdr.detectChanges();
    });
    this.api.getPaginated<any>('/admin/users', { limit: 1 }).subscribe(r => {
      this.totalUsers = r.total;
      this.cdr.detectChanges();
    });
  }
}
