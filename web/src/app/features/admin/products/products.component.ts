import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Product } from '../../../shared/models/product.model';
import { Category } from '../../../shared/models/category.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-products',
  standalone: false,
  template: `
    <div>
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Products</h1>
        <button (click)="openForm()"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          <app-icon name="plus" size="16px"></app-icon>
          New Product
        </button>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Price</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Stock</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Category</th>
                <th class="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of products" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-900">{{ p.name }}</td>
                <td class="px-6 py-4">\${{ p.price.toFixed(2) }}</td>
                <td class="px-6 py-4">{{ p.stock }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex px-2.5 py-0.5 text-xs font-medium text-white rounded-full"
                        [style.background]="p.status === 'active' ? '#22c55e' : p.status === 'out_of_stock' ? '#f59e0b' : '#ef4444'">
                    {{ p.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-600">{{ p.category_name }}</td>
                <td class="px-6 py-4 text-right">
                  <button (click)="openForm(p)" class="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    <app-icon name="edit" size="16px"></app-icon>
                  </button>
                  <button (click)="deleteProduct(p)" class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors ml-1">
                    <app-icon name="delete" size="16px"></app-icon>
                  </button>
                </td>
              </tr>
              <tr *ngIf="products.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-400">No products found.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <span class="text-sm text-gray-500">Total: {{ total }}</span>
          <div class="flex gap-2">
            <button (click)="load(currentPage - 1)" [disabled]="currentPage <= 1"
                    class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <button (click)="load(currentPage + 1)" [disabled]="products.length < 20"
                    class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>

      <!-- Form Overlay -->
      <div *ngIf="showForm" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" (click)="showForm = false"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">{{ editing ? 'Edit' : 'New' }} Product</h2>
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input type="text" formControlName="name"
                     class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
              <input type="text" formControlName="slug"
                     class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea formControlName="description" rows="3"
                        class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Price</label>
                <input type="number" formControlName="price"
                       class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Compare Price</label>
                <input type="number" formControlName="compare_price"
                       class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Stock</label>
                <input type="number" formControlName="stock"
                       class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select formControlName="category_id"
                        class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                  <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Images (JSON array)</label>
              <input type="text" formControlName="images" placeholder='["url1","url2"]'
                     class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400">
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="showForm = false"
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" [disabled]="form.invalid"
                      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed rounded-lg transition-colors">
                {{ editing ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  total = 0;
  currentPage = 1;
  showForm = false;
  editing: Product | null = null;
  form: FormGroup;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      compare_price: [null],
      stock: [0, [Validators.required, Validators.min(0)]],
      category_id: ['', Validators.required],
      images: [''],
    });
  }

  ngOnInit(): void {
    this.load(1);
    this.api.get<{ success: boolean; data: Category[] }>('/categories').subscribe({
      next: r => {
        this.categories = r.data || r as any;
        this.cdr.detectChanges();
      },
    });
  }

  load(page: number): void {
    this.currentPage = page;
    this.api.get<{ success: boolean; data: Product[]; total: number }>('/products?page=' + page + '&limit=20').subscribe({
      next: r => {
        this.products = r.data || r as any;
        this.total = r.total || 0;
        this.cdr.detectChanges();
      },
    });
  }

  openForm(p?: Product): void {
    this.editing = p || null;
    if (p) {
      this.form.patchValue({
        ...p,
        images: JSON.stringify(p.images || []),
      });
    } else {
      this.form.reset({ price: 0, stock: 0, images: '[]' });
    }
    this.showForm = true;
  }

  save(): void {
    const val = this.form.value;
    const body = { ...val, images: this.parseImages(val.images) };
    const obs = this.editing
      ? this.api.put('/admin/products/' + this.editing.id, body)
      : this.api.post('/admin/products', body);
    obs.subscribe({
      next: () => {
        this.toast.success(this.editing ? 'Product updated.' : 'Product created.');
        this.showForm = false;
        this.load(1);
        this.cdr.detectChanges();
      },
    });
  }

  deleteProduct(p: Product): void {
    if (confirm(`Delete "${p.name}"?`)) {
      this.api.delete('/admin/products/' + p.id).subscribe(() => {
        this.load(1);
        this.cdr.detectChanges();
      });
    }
  }

  private parseImages(v: string): string[] {
    try { return JSON.parse(v); } catch { return [v]; }
  }
}
