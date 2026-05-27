import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Log } from '../../../shared/models/log.model';

@Component({
  selector: 'app-logs',
  standalone: false,
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h1 style="font-weight:600;margin:0;">Audit Logs</h1>
        <button mat-stroked-button (click)="load(1)">
          <mat-icon>refresh</mat-icon> Refresh
        </button>
      </div>
      <p style="color:#999;margin-bottom:16px;">Immutable audit trail — logs are auto-inserted by database triggers and cannot be modified.</p>
      <mat-card>
        <table mat-table [dataSource]="logs" class="full-width">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let l">{{ l.id | slice:0:8 }}...</td>
          </ng-container>
          <ng-container matColumnDef="table_name">
            <th mat-header-cell *matHeaderCellDef>Table</th>
            <td mat-cell *matCellDef="let l">
              <span style="background:#e8eaf6;padding:2px 8px;border-radius:4px;font-size:0.8rem;">{{ l.table_name }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef>Action</th>
            <td mat-cell *matCellDef="let l">
              <span [style.background]="l.action === 'INSERT' ? '#e8f5e9' : l.action === 'UPDATE' ? '#fff3e0' : '#ffebee'"
                    style="padding:2px 8px;border-radius:4px;font-size:0.8rem;font-weight:600;">{{ l.action }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="record_id">
            <th mat-header-cell *matHeaderCellDef>Record ID</th>
            <td mat-cell *matCellDef="let l">{{ l.record_id | slice:0:8 }}...</td>
          </ng-container>
          <ng-container matColumnDef="user_id">
            <th mat-header-cell *matHeaderCellDef>User</th>
            <td mat-cell *matCellDef="let l">{{ l.user_id ? (l.user_id | slice:0:8) + '...' : 'System' }}</td>
          </ng-container>
          <ng-container matColumnDef="created_at">
            <th mat-header-cell *matHeaderCellDef>Timestamp</th>
            <td mat-cell *matCellDef="let l">{{ l.created_at | date:'medium' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <mat-paginator [length]="total" [pageSize]="20" (page)="load($event.pageIndex + 1)" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    td.mat-cell, th.mat-header-cell { padding: 8px 16px !important; }
  `],
})
export class LogsComponent implements OnInit {
  logs: Log[] = [];
  total = 0;
  columns = ['id', 'table_name', 'action', 'record_id', 'user_id', 'created_at'];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load(1);
  }

  load(page: number): void {
    this.api.getPaginated<Log>('/admin/logs', { page }).subscribe({
      next: r => {
        this.logs = r.data;
        this.total = r.total;
        this.cdr.detectChanges();
      },
    });
  }
}
