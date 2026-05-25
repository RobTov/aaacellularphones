import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: false,
  template: `
    <div class="container" style="max-width:900px;">
      <h1 style="font-weight:600;">My Orders</h1>
      <div *ngIf="loading" class="flex justify-center mt-4"><mat-spinner diameter="40"></mat-spinner></div>
      <div *ngIf="!loading && orders.length === 0" class="text-center mt-4">
        <mat-icon style="font-size:64px;color:#ccc;">receipt_long</mat-icon>
        <p style="color:#666;">No orders yet.</p>
        <button mat-raised-button color="primary" routerLink="/products">Start Shopping</button>
      </div>
      <mat-card *ngFor="let o of orders" style="margin-bottom:12px;cursor:pointer;" [routerLink]="['/orders', o.id]">
        <mat-card-content>
          <div class="flex items-center justify-between">
            <div>
              <div style="font-weight:600;">Order #{{ o.id | slice:0:8 }}...</div>
              <div style="color:#666;font-size:0.875rem;">{{ o.created_at | date:'medium' }}</div>
            </div>
            <div class="text-right">
              <span [style.background]="statusColor(o.status)" style="color:#fff;padding:2px 12px;border-radius:12px;font-size:0.8rem;">
                {{ o.status }}
              </span>
              <div style="font-weight:700;margin-top:4px;">\${{ o.total_amount.toFixed(2) }}</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<{ success: boolean; data: Order[] }>('/orders').subscribe({
      next: r => { this.orders = r.data || r as any; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  statusColor(s: string): string {
    const map: Record<string, string> = {
      pending: '#ff9800', confirmed: '#2196f3', processing: '#9c27b0',
      shipped: '#3f51b5', delivered: '#4caf50', cancelled: '#f44336',
    };
    return map[s] || '#999';
  }
}
