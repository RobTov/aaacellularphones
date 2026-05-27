import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Review } from '../../../shared/models/review.model';

@Component({
  selector: 'app-admin-reviews',
  standalone: false,
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Reviews</h1>

      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-6 py-3 font-medium text-gray-500">User</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Rating</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Title</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Approved</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                <th class="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of reviews" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-900">{{ r.user?.first_name || r.user_id | slice:0:8 }}</td>
                <td class="px-6 py-4">{{ r.rating }}/5</td>
                <td class="px-6 py-4 text-gray-600">{{ r.title || '-' }}</td>
                <td class="px-6 py-4">
                  <app-icon [name]="r.is_approved ? 'check_circle' : 'cancel'"
                            [color]="r.is_approved ? '#22c55e' : '#ef4444'" size="18px">
                  </app-icon>
                </td>
                <td class="px-6 py-4 text-gray-500 text-xs">{{ r.created_at | date }}</td>
                <td class="px-6 py-4 text-right">
                  <button *ngIf="!r.is_approved" (click)="approve(r)"
                          class="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                    <app-icon name="thumb_up" size="16px"></app-icon>
                  </button>
                  <button (click)="deleteReview(r)"
                          class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors ml-1">
                    <app-icon name="delete" size="16px"></app-icon>
                  </button>
                </td>
              </tr>
              <tr *ngIf="reviews.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-400">No reviews found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AdminReviewsComponent implements OnInit {
  reviews: Review[] = [];

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
