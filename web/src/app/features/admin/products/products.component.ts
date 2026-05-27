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
      <div class="flex items-center justify-between mb-2">
        <h1 style="font-weight:600;margin:0;">Products</h1>
        <button mat-raised-button color="primary" (click)="openForm()">+ New Product</button>
      </div>

      <mat-card>
        <table mat-table [dataSource]="products" class="full-width">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let p">{{ p.name }}</td>
          </ng-container>
          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef>Price</th>
            <td mat-cell *matCellDef="let p">\${{ p.price.toFixed(2) }}</td>
          </ng-container>
          <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef>Stock</th>
            <td mat-cell *matCellDef="let p">{{ p.stock }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let p">
              <span [style.background]="p.status === 'active' ? '#4caf50' : p.status === 'out_of_stock' ? '#ff9800' : '#f44336'"
                    style="color:#fff;padding:2px 8px;border-radius:4px;font-size:0.8rem;">{{ p.status }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let p">{{ p.category_name }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let p">
              <button mat-icon-button (click)="openForm(p)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="deleteProduct(p)"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <mat-paginator [length]="total" [pageSize]="20" (page)="load($event.pageIndex + 1)" showFirstLastButtons></mat-paginator>
      </mat-card>

      <!-- Form Dialog Overlay (inline) -->
      <div *ngIf="showForm" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;">
        <mat-card style="min-width:400px;max-width:600px;max-height:90vh;overflow:auto;padding:24px;">
          <h2 style="font-weight:600;margin:0 0 16px;">{{ editing ? 'Edit' : 'New' }} Product</h2>
          <form [formGroup]="form" (ngSubmit)="save()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Slug</mat-label>
              <input matInput formControlName="slug">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>
            <div class="flex gap-2">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Price</mat-label>
                <input matInput type="number" formControlName="price">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Compare Price</mat-label>
                <input matInput type="number" formControlName="compare_price">
              </mat-form-field>
            </div>
            <div class="flex gap-2">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Stock</mat-label>
                <input matInput type="number" formControlName="stock">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category_id">
                  <mat-option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Images (JSON array)</mat-label>
              <input matInput formControlName="images" placeholder='["url1","url2"]'>
            </mat-form-field>
            <div class="flex justify-end gap-1 mt-2">
              <button mat-button type="button" (click)="showForm = false">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">{{ editing ? 'Update' : 'Create' }}</button>
            </div>
          </form>
        </mat-card>
      </div>
    </div>
  `,
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  total = 0;
  columns = ['name', 'price', 'stock', 'status', 'category', 'actions'];
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
