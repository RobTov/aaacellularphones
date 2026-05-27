import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Category } from '../../../shared/models/category.model';
import { Product, ProductFilter } from '../../../shared/models/product.model';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-list',
  standalone: false,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filters -->
      <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <select [(ngModel)]="filter.category_id" (change)="load()"
                    class="w-full sm:w-48 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
              <option value="">All Categories</option>
              <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
            </select>
            <input [(ngModel)]="filter.search" (keyup.enter)="load()" placeholder="Search products..."
                   class="w-full sm:w-56 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400">
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <select [(ngModel)]="filter.sort_by" (change)="load()"
                    class="flex-1 sm:flex-none px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
              <option value="newest">Newest</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
            </select>
            <button (click)="toggleSortOrder()"
                    class="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
              <app-icon [name]="filter.sort_order === 'desc' ? 'arrow_downward' : 'arrow_upward'" size="18px"></app-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div *ngFor="let _ of [1,2,3,4,5,6,7,8]" class="loading-shimmer h-96 rounded-xl"></div>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && products.length === 0" class="text-center py-16">
        <app-icon name="search_off" size="56px" class="text-gray-300"></app-icon>
        <p class="text-gray-500 mt-4">No products found.</p>
      </div>

      <!-- Products -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" *ngIf="!loading && products.length > 0">
        <app-product-card *ngFor="let p of products" [product]="p" (add)="addToCart($event)"></app-product-card>
      </div>

      <!-- Pagination -->
      <div *ngIf="totalPages > 1" class="flex justify-center items-center gap-2 mt-8">
        <button (click)="changePage(page - 1)" [disabled]="page <= 1"
                class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Previous
        </button>
        <span class="text-sm text-gray-600">Page {{ page }} of {{ totalPages }}</span>
        <button (click)="changePage(page + 1)" [disabled]="page >= totalPages"
                class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Next
        </button>
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
    private cdr: ChangeDetectorRef,
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
    this.api.get<Category[]>('/categories').subscribe({
      next: r => {
        this.categories = r;
        this.cdr.detectChanges();
      },
      error: () => console.warn('Failed to load categories'),
    });
  }

  load(): void {
    this.loading = true;
    this.api.getPaginated<Product>('/products', this.filter).subscribe({
      next: r => {
        this.products = r.data;
        this.total = r.total;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  addToCart(product: Product): void {
    this.cart.add(product);
  }

  toggleSortOrder(): void {
    this.filter.sort_order = this.filter.sort_order === 'desc' ? 'asc' : 'desc';
    this.load();
  }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.filter.page = p;
    this.load();
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }
}
