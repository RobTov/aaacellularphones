import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Review } from '../../../shared/models/review.model';

@Component({
  selector: 'app-admin-reviews',
  standalone: false,
  template: `
    <div>
      <h1 style="font-weight:600;margin:0 0 16px;">Reviews</h1>
      <mat-card>
        <table mat-table [dataSource]="reviews" class="full-width">
          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef>User</th>
            <td mat-cell *matCellDef="let r">{{ r.user?.first_name || r.user_id | slice:0:8 }}</td>
          </ng-container>
          <ng-container matColumnDef="rating">
            <th mat-header-cell *matHeaderCellDef>Rating</th>
            <td mat-cell *matCellDef="let r">{{ r.rating }}/5</td>
          </ng-container>
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Title</th>
            <td mat-cell *matCellDef="let r">{{ r.title || '-' }}</td>
          </ng-container>
          <ng-container matColumnDef="approved">
            <th mat-header-cell *matHeaderCellDef>Approved</th>
            <td mat-cell *matCellDef="let r">
              <mat-icon [style.color]="r.is_approved ? '#4caf50' : '#f44336'">{{ r.is_approved ? 'check_circle' : 'cancel' }}</mat-icon>
            </td>
          </ng-container>
          <ng-container matColumnDef="created">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let r">{{ r.created_at | date }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let r">
              <button mat-icon-button *ngIf="!r.is_approved" (click)="approve(r)" matTooltip="Approve">
                <mat-icon style="color:#4caf50;">thumb_up</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteReview(r)"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      </mat-card>
    </div>
  `,
})
export class AdminReviewsComponent implements OnInit {
  reviews: Review[] = [];
  columns = ['user', 'rating', 'title', 'approved', 'created', 'actions'];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<any[]>('/products?limit=10').subscribe({
      next: () => {
        this.reviews = [];
        this.cdr.detectChanges();
      },
    });
  }

  approve(r: Review): void {
    this.api.put('/admin/reviews/' + r.id + '/approve', {}).subscribe({
      next: () => {
        r.is_approved = true;
        this.cdr.detectChanges();
      },
    });
  }

  deleteReview(r: Review): void {
    if (confirm('Delete this review?')) {
      this.api.delete('/admin/reviews/' + r.id).subscribe(() => {
        this.load();
        this.cdr.detectChanges();
      });
    }
  }
}
