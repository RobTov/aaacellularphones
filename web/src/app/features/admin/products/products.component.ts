import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { Product, ProductSpecification } from '../../../shared/models/product.model';
import { Category } from '../../../shared/models/category.model';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

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
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Images</label>
              <div class="flex flex-wrap gap-2 mb-2">
                <div *ngFor="let url of imageUrls; let i = index" class="relative group">
                  <img [src]="url" class="w-20 h-20 object-cover rounded-lg border border-gray-200">
                  <button type="button" (click)="removeImage(i)"
                          class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                    &times;
                  </button>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <label class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <app-icon name="plus" size="16px"></app-icon>
                  Upload Images
                  <input type="file" accept="image/*" multiple (change)="uploadFiles($event)" class="hidden">
                </label>
                <span *ngIf="uploading" class="text-sm text-gray-500">Uploading...</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Specifications</label>
              <div formArrayName="specifications" class="space-y-2">
                <div *ngFor="let spec of specifications.controls; let i = index" [formGroupName]="i" class="flex gap-2 items-start">
                  <input type="text" formControlName="name" placeholder="Name (e.g. Model)"
                         class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400">
                  <input type="text" formControlName="value" placeholder="Value (e.g. Thinkpad)"
                         class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400">
                  <button type="button" (click)="removeSpec(i)"
                          class="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    <app-icon name="delete" size="16px"></app-icon>
                  </button>
                </div>
              </div>
              <button type="button" (click)="addSpec()"
                      class="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                <app-icon name="plus" size="14px"></app-icon>
                Add Specification
              </button>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="showForm = false"
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" [disabled]="form.invalid || uploading"
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
  imageUrls: string[] = [];
  uploading = false;

  constructor(
    private api: ApiService,
    private http: HttpClient,
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
      specifications: this.fb.array([]),
    });
  }

  get specifications(): FormArray {
    return this.form.get('specifications') as FormArray;
  }

  private buildSpecGroup(spec?: ProductSpecification): FormGroup {
    return this.fb.group({
      name: [spec?.name || ''],
      value: [spec?.value || ''],
    });
  }

  addSpec(spec?: ProductSpecification): void {
    this.specifications.push(this.buildSpecGroup(spec));
    this.cdr.detectChanges();
  }

  removeSpec(index: number): void {
    this.specifications.removeAt(index);
    this.cdr.detectChanges();
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
    this.specifications.clear();
    this.imageUrls = p?.images ? [...p.images] : [];
    if (p) {
      this.form.patchValue({
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compare_price: p.compare_price,
        stock: p.stock,
        category_id: p.category_id,
      });
      (p.specifications || []).forEach(spec => this.addSpec(spec));
    } else {
      this.form.reset({ price: 0, stock: 0 });
    }
    this.showForm = true;
  }

  uploadFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.uploading = true;
    const formData = new FormData();
    for (let i = 0; i < input.files.length; i++) {
      formData.append('files', input.files[i]);
    }

    this.http.post<{ success: boolean; data: string[] }>(
      environment.apiUrl + '/admin/upload', formData
    ).subscribe({
      next: r => {
        this.imageUrls.push(...(r.data || r as any));
        this.uploading = false;
        input.value = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.uploading = false;
        this.toast.error('Failed to upload images.');
        this.cdr.detectChanges();
      },
    });
  }

  removeImage(index: number): void {
    this.imageUrls.splice(index, 1);
    this.cdr.detectChanges();
  }

  save(): void {
    const val = this.form.value;
    const body = {
      ...val,
      images: this.imageUrls,
      specifications: (val.specifications || []).filter((s: any) => s.name || s.value),
    };
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
      error: () => {
        this.toast.error('Failed to save product.');
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
}
