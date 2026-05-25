import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Category } from '../../../shared/models/category.model';
import { Product, ProductFilter } from '../../../shared/models/product.model';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-list',
  standalone: false,
  template: `
    <div class="container">
      <!-- Filters -->
      <mat-card style="margin-bottom:24px;padding:16px;">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <mat-form-field appearance="outline" style="min-width:200px;">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="filter.category_id" (selectionChange)="load()">
                <mat-option value="">All Categories</mat-option>
                <mat-option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" style="min-width:200px;">
              <mat-label>Search</mat-label>
              <input matInput [(ngModel)]="filter.search" (keyup.enter)="load()" placeholder="Search products...">
            </mat-form-field>
          </div>
          <div class="flex items-center gap-1">
            <mat-form-field appearance="outline" style="min-width:160px;">
              <mat-label>Sort By</mat-label>
              <mat-select [(ngModel)]="filter.sort_by" (selectionChange)="load()">
                <mat-option value="newest">Newest</mat-option>
                <mat-option value="price">Price</mat-option>
                <mat-option value="name">Name</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-icon-button (click)="toggleSortOrder()" matTooltip="Toggle order">
              <mat-icon>{{ filter.sort_order === 'desc' ? 'arrow_downward' : 'arrow_upward' }}</mat-icon>
            </button>
          </div>
        </div>
      </mat-card>

      <!-- Products -->
      <div *ngIf="loading" class="product-grid">
        <div *ngFor="let _ of [1,2,3,4,5,6]" class="loading-shimmer" style="height:360px;"></div>
      </div>

      <div *ngIf="!loading && products.length === 0" class="text-center mt-4">
        <mat-icon style="font-size:64px;color:#ccc;">search_off</mat-icon>
        <p style="color:#666;">No products found.</p>
      </div>

      <div class="product-grid" *ngIf="!loading">
        <app-product-card *ngFor="let p of products" [product]="p" (add)="addToCart($event)">
        </app-product-card>
      </div>

      <!-- Pagination -->
      <div class="flex justify-center mt-4 mb-4" *ngIf="totalPages > 1">
        <mat-paginator [length]="total" [pageSize]="limit" [pageIndex]="page - 1"
          (page)="changePage($event)" showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  filter: ProductFilter = { sort_by: 'newest', sort_order: 'desc', page: 1, limit: 12 };
  loading = true;
  total = 0;
  page = 1;
  limit = 12;

  constructor(
    private api: ApiService,
    private cart: CartService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['category_id']) this.filter.category_id = params['category_id'];
      if (params['search']) this.filter.search = params['search'];
    });
    this.loadCategories();
    this.load();
  }

  loadCategories(): void {
    this.api.get<{ success: boolean; data: Category[] }>('/categories').subscribe({
      next: r => this.categories = r.data || r as any,
    });
  }

  load(): void {
    this.loading = true;
    this.api.get<{ success: boolean; data: Product[]; total: number }>('/products', this.filter).subscribe({
      next: r => {
        this.products = r.data || r as any;
        this.total = r.total || 0;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  addToCart(product: Product): void {
    this.cart.add(product);
  }

  toggleSortOrder(): void {
    this.filter.sort_order = this.filter.sort_order === 'desc' ? 'asc' : 'desc';
    this.load();
  }

  changePage(e: any): void {
    this.page = e.pageIndex + 1;
    this.filter.page = this.page;
    this.load();
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }
}
