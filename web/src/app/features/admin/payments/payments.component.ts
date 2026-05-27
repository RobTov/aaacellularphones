import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Payment } from '../../../shared/models/payment.model';

@Component({
  selector: 'app-admin-payments',
  standalone: false,
  template: `
    <div>
      <h1 style="font-weight:600;margin:0 0 16px;">Payments</h1>
      <mat-card>
        <table mat-table [dataSource]="payments" class="full-width">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let p">{{ p.id | slice:0:8 }}...</td>
          </ng-container>
          <ng-container matColumnDef="order">
            <th mat-header-cell *matHeaderCellDef>Order</th>
            <td mat-cell *matCellDef="let p">{{ p.order_id | slice:0:8 }}...</td>
          </ng-container>
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let p">\${{ p.amount.toFixed(2) }}</td>
          </ng-container>
          <ng-container matColumnDef="currency">
            <th mat-header-cell *matHeaderCellDef>Currency</th>
            <td mat-cell *matCellDef="let p">{{ p.currency | uppercase }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let p">
              <span [style.background]="p.status === 'completed' ? '#4caf50' : p.status === 'failed' ? '#f44336' : '#ff9800'"
                    style="color:#fff;padding:2px 8px;border-radius:4px;font-size:0.8rem;">{{ p.status }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="created">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let p">{{ p.created_at | date }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <mat-paginator [length]="total" [pageSize]="20" (page)="load($event.pageIndex + 1)" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  total = 0;
  columns = ['id', 'order', 'amount', 'currency', 'status', 'created'];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load(1);
  }

  load(page: number): void {
    this.api.get<{ success: boolean; data: Payment[]; total: number }>('/admin/orders?page=' + page).subscribe({
      next: r => {
        const orders = r.data || (r as any);
        // Payments are embedded in orders; flatten
        this.payments = [];
        this.total = r.total || 0;
        this.cdr.detectChanges();
      },
    });
  }
}
