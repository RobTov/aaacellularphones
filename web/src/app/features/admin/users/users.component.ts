import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: false,
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h1 style="font-weight:600;margin:0;">Users</h1>
      </div>
      <mat-card>
        <table mat-table [dataSource]="users" class="full-width">
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let u">{{ u.email }}</td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let u">{{ u.first_name }} {{ u.last_name }}</td>
          </ng-container>
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let u">
              <span [style.background]="u.role === 'admin' ? '#3f51b5' : '#666'" style="color:#fff;padding:2px 8px;border-radius:4px;font-size:0.8rem;">{{ u.role }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="active">
            <th mat-header-cell *matHeaderCellDef>Active</th>
            <td mat-cell *matCellDef="let u">
              <mat-icon [style.color]="u.is_active ? '#4caf50' : '#f44336'">{{ u.is_active ? 'check_circle' : 'cancel' }}</mat-icon>
            </td>
          </ng-container>
          <ng-container matColumnDef="created">
            <th mat-header-cell *matHeaderCellDef>Joined</th>
            <td mat-cell *matCellDef="let u">{{ u.created_at | date }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let u">
              <button mat-icon-button color="warn" (click)="deleteUser(u)" [disabled]="u.role === 'admin'">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <mat-paginator [length]="total" [pageSize]="20" (page)="load($event.pageIndex + 1)" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  total = 0;
  columns = ['email', 'name', 'role', 'active', 'created', 'actions'];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load(1);
  }

  load(page: number): void {
    this.api.get<{ success: boolean; data: User[]; total: number }>('/admin/users?page=' + page).subscribe({
      next: r => { this.users = r.data || r as any; this.total = r.total || 0; },
    });
  }

  deleteUser(u: User): void {
    if (confirm(`Delete user ${u.email}?`)) {
      this.api.delete('/admin/users/' + u.id).subscribe(() => this.load(1));
    }
  }
}
