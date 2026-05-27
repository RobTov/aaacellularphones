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
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" *ngIf="product">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Images -->
        <div>
          <img [src]="selectedImage || product.images[0] || 'assets/placeholder.svg'"
               [alt]="product.name"
               class="w-full rounded-2xl object-cover max-h-[500px]">
          <div *ngIf="product.images.length > 1" class="flex gap-3 mt-4">
            <img *ngFor="let img of product.images" [src]="img"
                 (click)="selectedImage = img"
                 class="w-20 h-20 object-cover rounded-xl cursor-pointer border-2 transition-colors"
                 [class.border-blue-500]="img === selectedImage"
                 [class.border-gray-200]="img !== selectedImage">
          </div>
        </div>

        <!-- Details -->
        <div>
          <p class="text-sm font-medium text-blue-600 uppercase tracking-wider mb-2">{{ product.category_name }}</p>
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ product.name }}</h1>
          <div class="flex items-baseline gap-3 mb-6">
            <span class="text-3xl font-bold text-blue-600">\${{ product.price.toFixed(2) }}</span>
            <span *ngIf="product.compare_price" class="text-xl text-gray-400 line-through">
              \${{ product.compare_price.toFixed(2) }}
            </span>
          </div>

          <div class="flex flex-wrap gap-2 mb-6">
            <span *ngIf="product.status === 'out_of_stock' || product.stock === 0"
                  class="inline-flex items-center px-3 py-1 text-sm font-medium bg-red-100 text-red-700 rounded-full">Out of Stock</span>
            <span *ngIf="product.stock > 0 && product.stock <= 5"
                  class="inline-flex items-center px-3 py-1 text-sm font-medium bg-orange-100 text-orange-700 rounded-full">Only {{ product.stock }} left</span>
            <span *ngIf="product.stock > 5"
                  class="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">In Stock</span>
          </div>

          <p class="text-gray-600 leading-relaxed mb-8">{{ product.description }}</p>

          <div class="flex items-center gap-4">
            <div class="flex items-center border border-gray-300 rounded-lg">
              <button (click)="quantity = Math.max(1, quantity - 1); cdr.detectChanges()"
                      class="px-3 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-l-lg">
                <app-icon name="remove" size="16px"></app-icon>
              </button>
              <span class="px-4 py-2.5 text-sm font-medium border-x border-gray-300 min-w-[48px] text-center">{{ quantity }}</span>
              <button (click)="quantity = Math.min(product.stock, quantity + 1); cdr.detectChanges()"
                      class="px-3 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-r-lg"
                      [class.opacity-50]="quantity >= product.stock">
                <app-icon name="add" size="16px"></app-icon>
              </button>
            </div>
            <button
              class="px-8 py-2.5 text-sm font-medium rounded-lg transition-colors"
              [class]="(product.status === 'out_of_stock' || product.stock === 0)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'"
              [disabled]="product.status === 'out_of_stock' || product.stock === 0"
              (click)="addToCart()">
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <!-- Reviews -->
      <div class="mt-16 bg-white rounded-2xl border border-gray-200 p-8">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Reviews</h2>

        <div *ngIf="auth.isAuthenticated()" class="mb-8">
          <form [formGroup]="reviewForm" (ngSubmit)="submitReview()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Rating</label>
              <select formControlName="rating"
                      class="w-32 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                <option *ngFor="let r of [1,2,3,4,5]" [value]="r">{{ r }} Star{{ r > 1 ? 's' : '' }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <input type="text" formControlName="title"
                     class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Comment</label>
              <textarea formControlName="comment" rows="3"
                        class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"></textarea>
            </div>
            <button type="submit" [disabled]="reviewForm.invalid"
                    class="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed rounded-lg transition-colors">
              Submit
            </button>
          </form>
        </div>

        <div *ngIf="reviews.length === 0">
          <p class="text-gray-400 text-center py-8">No reviews yet.</p>
        </div>

        <div *ngFor="let r of reviews" class="border-b border-gray-100 last:border-0 py-5 first:pt-0 last:pb-0">
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-gray-900">{{ r.user?.first_name || 'Anonymous' }}</span>
            <span class="text-sm text-gray-500">{{ r.rating }}/5 - {{ r.created_at | date }}</span>
          </div>
          <p *ngIf="r.title" class="font-medium text-gray-700 text-sm mb-1">{{ r.title }}</p>
          <p class="text-gray-600 text-sm leading-relaxed">{{ r.comment }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class ProductDetailComponent implements OnInit {
  product?: Product;
  reviews: Review[] = [];
  selectedImage = '';
  quantity = 1;
  reviewForm: FormGroup;
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private cart: CartService,
    public auth: AuthService,
    private fb: FormBuilder,
    public cdr: ChangeDetectorRef,
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
