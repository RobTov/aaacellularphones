import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: false,
  template: `
    <div class="container" style="max-width:800px;" *ngIf="order">
      <h1 style="font-weight:600;">Order Detail</h1>
      <mat-card style="margin-bottom:16px;padding:16px;">
        <div class="flex items-center justify-between">
          <div>
            <div style="color:#666;">Order #{{ order.id }}</div>
            <div style="color:#666;font-size:0.875rem;">{{ order.created_at | date:'medium' }}</div>
          </div>
          <span [style.background]="statusColor(order.status)" style="color:#fff;padding:4px 16px;border-radius:12px;">
            {{ order.status }}
          </span>
        </div>
      </mat-card>

      <mat-card style="margin-bottom:16px;padding:16px;">
        <h3 style="font-weight:600;margin:0 0 12px;">Items</h3>
        <div *ngFor="let item of order.items" class="flex items-center gap-2" style="padding:8px 0;">
          <img [src]="item.product_image || 'assets/placeholder.svg'" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
          <div style="flex:1;">
            <div style="font-weight:500;">{{ item.product_name }}</div>
            <div style="color:#666;font-size:0.875rem;">{{ item.quantity }} x \${{ item.unit_price.toFixed(2) }}</div>
          </div>
          <div style="font-weight:600;">\${{ item.total_price.toFixed(2) }}</div>
        </div>
        <mat-divider></mat-divider>
        <div class="flex justify-between" style="padding-top:12px;font-size:1.25rem;font-weight:700;">
          <span>Total</span>
          <span style="color:#3f51b5;">\${{ order.total_amount.toFixed(2) }}</span>
        </div>
      </mat-card>

      <mat-card *ngIf="order.payment" style="padding:16px;">
        <h3 style="font-weight:600;margin:0 0 12px;">Payment</h3>
        <div class="flex justify-between"><span style="color:#666;">Status</span><span>{{ order.payment.status }}</span></div>
        <div class="flex justify-between"><span style="color:#666;">Amount</span><span>\${{ order.payment.amount.toFixed(2) }}</span></div>
        <div class="flex justify-between"><span style="color:#666;">Currency</span><span>{{ order.payment.currency | uppercase }}</span></div>
      </mat-card>
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
      pending: '#ff9800', confirmed: '#2196f3', processing: '#9c27b0',
      shipped: '#3f51b5', delivered: '#4caf50', cancelled: '#f44336',
    };
    return map[s] || '#999';
  }
}
