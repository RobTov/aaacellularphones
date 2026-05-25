import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Order, OrderStatus } from '../../../shared/models/order.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-orders',
  standalone: false,
  template: `
    <div>
      <h1 style="font-weight:600;margin:0 0 16px;">Orders</h1>
      <mat-card>
        <table mat-table [dataSource]="orders" class="full-width">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let o">{{ o.id | slice:0:8 }}...</td>
          </ng-container>
          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef>Customer</th>
            <td mat-cell *matCellDef="let o">{{ o.user?.email || o.user_id | slice:0:8 }}</td>
          </ng-container>
          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef>Total</th>
            <td mat-cell *matCellDef="let o">\${{ o.total_amount.toFixed(2) }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let o">
              <mat-select [value]="o.status" (selectionChange)="updateStatus(o, $event.value)" style="width:130px;">
                <mat-option *ngFor="let s of statuses" [value]="s">{{ s }}</mat-option>
              </mat-select>
            </td>
          </ng-container>
          <ng-container matColumnDef="created">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let o">{{ o.created_at | date:'short' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <mat-paginator [length]="total" [pageSize]="20" (page)="load($event.pageIndex + 1)" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  total = 0;
  columns = ['id', 'customer', 'total', 'status', 'created'];
  statuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  constructor(
    private api: ApiService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.load(1);
  }

  load(page: number): void {
    this.api.get<{ success: boolean; data: Order[]; total: number }>('/admin/orders?page=' + page).subscribe({
      next: r => { this.orders = r.data || r as any; this.total = r.total || 0; },
    });
  }

  updateStatus(o: Order, status: OrderStatus): void {
    this.api.put('/admin/orders/' + o.id + '/status', { status }).subscribe({
      next: () => {
        o.status = status;
        this.toast.success('Order status updated.');
      },
    });
  }
}
