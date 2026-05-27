import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  template: `
    <div>
      <h1 style="font-weight:600;margin-bottom:24px;">Dashboard</h1>

      <!-- Stats -->
      <div class="admin-grid mb-4">
        <mat-card class="stat-card">
          <div class="stat-value">\${{ totalRevenue.toFixed(2) }}</div>
          <div class="stat-label">Total Revenue</div>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-value">{{ totalOrders }}</div>
          <div class="stat-label">Orders</div>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-value">{{ totalProducts }}</div>
          <div class="stat-label">Products</div>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-value">{{ totalUsers }}</div>
          <div class="stat-label">Users</div>
        </mat-card>
      </div>

      <!-- Revenue summary table instead of chart -->
      <mat-card style="padding:16px;">
        <h3 style="font-weight:600;margin:0 0 16px;">Recent Orders</h3>
        <table mat-table [dataSource]="recentOrders" class="full-width">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let o">{{ o.id | slice:0:8 }}...</td>
          </ng-container>
          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef>Customer</th>
            <td mat-cell *matCellDef="let o">{{ o.user?.email || o.user_id | slice:0:8 }}</td>
          </ng-container>
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let o">\${{ o.total_amount.toFixed(2) }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let o">
              <span [style.background]="o.status === 'delivered' ? '#4caf50' : o.status === 'cancelled' ? '#f44336' : '#ff9800'" style="color:#fff;padding:2px 8px;border-radius:4px;font-size:0.8rem;">{{ o.status }}</span>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="['id', 'customer', 'amount', 'status']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['id', 'customer', 'amount', 'status'];"></tr>
        </table>
      </mat-card>
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
