import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Product } from '../../../shared/models/product.model';
import { Review } from '../../../shared/models/review.model';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  template: `
    <div class="container" *ngIf="product">
      <div class="flex flex-wrap gap-2 mt-2">
        <!-- Images -->
        <div style="flex:1;min-width:300px;">
          <img [src]="(product.images?.[0]) || 'assets/placeholder.svg'"
               [alt]="product.name" style="width:100%;border-radius:12px;max-height:400px;object-fit:cover;">
           <div class="flex gap-1 mt-1" *ngIf="(product?.images?.length ?? 0) > 1">
            <img *ngFor="let img of product.images" [src]="img"
                 style="width:80px;height:80px;object-fit:cover;border-radius:8px;cursor:pointer;"
                 (click)="selectedImage = img" [class.selected]="img === selectedImage">
          </div>
        </div>
        <!-- Details -->
        <div style="flex:1;min-width:300px;">
          <h1 style="font-size:1.75rem;font-weight:700;margin:0 0 8px;">{{ product.name }}</h1>
          <div style="color:#666;margin-bottom:16px;">{{ product.category_name }}</div>
          <div class="flex items-center gap-1 mb-2">
            <span style="font-size:2rem;font-weight:700;color:#3f51b5;">\${{ product.price.toFixed(2) }}</span>
            <span *ngIf="product.compare_price" style="text-decoration:line-through;color:#999;font-size:1.25rem;">
              \${{ product.compare_price.toFixed(2) }}
            </span>
          </div>
          <div style="margin-bottom:16px;">
            <span *ngIf="product.status === 'out_of_stock' || product.stock === 0"
                  style="background:#f44336;color:#fff;padding:4px 12px;border-radius:4px;">Out of Stock</span>
            <span *ngIf="product.stock > 0 && product.stock <= 5"
                  style="background:#ff9800;color:#fff;padding:4px 12px;border-radius:4px;">Only {{ product.stock }} left</span>
            <span *ngIf="product.stock > 5"
                  style="background:#4caf50;color:#fff;padding:4px 12px;border-radius:4px;">In Stock</span>
          </div>
          <p style="line-height:1.6;color:#444;">{{ product.description }}</p>
          <div class="flex items-center gap-1 mt-2">
            <mat-form-field appearance="outline" style="width:100px;">
              <mat-label>Qty</mat-label>
              <input matInput type="number" [(ngModel)]="quantity" min="1" [max]="product.stock">
            </mat-form-field>
            <button mat-raised-button color="primary" size="large"
                    [disabled]="product.status === 'out_of_stock' || product.stock === 0"
                    (click)="addToCart()">
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <!-- Reviews -->
      <mat-card style="margin-top:32px;padding:24px;">
        <h2 style="font-weight:600;margin:0 0 16px;">Reviews</h2>
        <div *ngIf="auth.isAuthenticated()">
          <form [formGroup]="reviewForm" (ngSubmit)="submitReview()" class="flex flex-wrap gap-1 mb-4">
            <mat-form-field appearance="outline" style="min-width:120px;">
              <mat-label>Rating</mat-label>
              <mat-select formControlName="rating">
                <mat-option *ngFor="let r of [1,2,3,4,5]" [value]="r">{{ r }} Star{{ r > 1 ? 's' : '' }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" style="flex:1;min-width:200px;">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title">
            </mat-form-field>
            <mat-form-field appearance="outline" style="flex:2;min-width:300px;">
              <mat-label>Comment</mat-label>
              <textarea matInput formControlName="comment" rows="2"></textarea>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="reviewForm.invalid">Submit</button>
          </form>
        </div>
        <div *ngIf="reviews.length === 0"><p style="color:#999;">No reviews yet.</p></div>
        <mat-divider *ngFor="let r of reviews; let last = last"></mat-divider>
        <div *ngFor="let r of reviews" style="padding:16px 0;">
          <div class="flex items-center justify-between">
            <strong>{{ r.user?.first_name || 'Anonymous' }}</strong>
            <span>{{ r.rating }}/5 - {{ r.created_at | date }}</span>
          </div>
          <div *ngIf="r.title" style="font-weight:500;margin-top:4px;">{{ r.title }}</div>
          <p style="margin:4px 0 0;color:#555;">{{ r.comment }}</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .selected { border: 2px solid #3f51b5; }
  `],
})
export class ProductDetailComponent implements OnInit {
  product?: Product;
  reviews: Review[] = [];
  selectedImage = '';
  quantity = 1;
  reviewForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private cart: CartService,
    public auth: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, Validators.required],
      title: [''],
      comment: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.api.get<Product>('/products/slug/' + slug).subscribe({
      next: r => {
        this.product = r;
        this.selectedImage = r.images?.[0] || '';
        this.cdr.detectChanges();
        this.api.get<Review[]>('/products/' + r.id + '/reviews').subscribe({
          next: revs => {
            this.reviews = revs;
            this.cdr.detectChanges();
          },
        });
      },
    });
  }

  addToCart(): void {
    if (this.product) this.cart.add(this.product);
  }

  submitReview(): void {
    if (!this.product || this.reviewForm.invalid) return;
    this.api.post<Review>('/products/' + this.product.id + '/reviews', this.reviewForm.value).subscribe({
      next: () => {
        this.reviewForm.reset({ rating: 5, title: '', comment: '' });
        this.api.get<Review[]>('/products/' + this.product!.id + '/reviews').subscribe({
          next: r => {
            this.reviews = r;
            this.cdr.detectChanges();
          },
        });
      },
    });
  }
}
