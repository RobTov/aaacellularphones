import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Category } from '../../../shared/models/category.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-categories',
  standalone: false,
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h1 style="font-weight:600;margin:0;">Categories</h1>
        <button mat-raised-button color="primary" (click)="openForm()">+ New Category</button>
      </div>
      <mat-card>
        <table mat-table [dataSource]="categories" class="full-width">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let c">{{ c.name }}</td>
          </ng-container>
          <ng-container matColumnDef="slug">
            <th mat-header-cell *matHeaderCellDef>Slug</th>
            <td mat-cell *matCellDef="let c">{{ c.slug }}</td>
          </ng-container>
          <ng-container matColumnDef="sort_order">
            <th mat-header-cell *matHeaderCellDef>Order</th>
            <td mat-cell *matCellDef="let c">{{ c.sort_order }}</td>
          </ng-container>
          <ng-container matColumnDef="active">
            <th mat-header-cell *matHeaderCellDef>Active</th>
            <td mat-cell *matCellDef="let c">
              <mat-icon [style.color]="c.is_active ? '#4caf50' : '#f44336'">{{ c.is_active ? 'check_circle' : 'cancel' }}</mat-icon>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button (click)="openForm(c)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="deleteCategory(c)"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      </mat-card>

      <div *ngIf="showForm" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;">
        <mat-card style="min-width:400px;padding:24px;">
          <h2 style="font-weight:600;margin:0 0 16px;">{{ editing ? 'Edit' : 'New' }} Category</h2>
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
              <textarea matInput formControlName="description" rows="2"></textarea>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Image URL</mat-label>
              <input matInput formControlName="image_url">
            </mat-form-field>
            <div class="flex gap-2">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Sort Order</mat-label>
                <input matInput type="number" formControlName="sort_order">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Parent Category</mat-label>
                <mat-select formControlName="parent_id">
                  <mat-option [value]="null">None</mat-option>
                  <mat-option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <div class="flex justify-end gap-1 mt-2">
              <button mat-button type="button" (click)="showForm = false">Cancel</button>
              <button mat-raised-button color="primary" type="submit">{{ editing ? 'Update' : 'Create' }}</button>
            </div>
          </form>
        </mat-card>
      </div>
    </div>
  `,
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  columns = ['name', 'slug', 'sort_order', 'active', 'actions'];
  showForm = false;
  editing: Category | null = null;
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
      image_url: [''],
      sort_order: [0],
      parent_id: [null],
      is_active: [true],
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<{ success: boolean; data: Category[] }>('/categories').subscribe({
      next: r => {
        this.categories = r.data || r as any;
        this.cdr.detectChanges();
      },
    });
  }

  openForm(c?: Category): void {
    this.editing = c || null;
    this.form.patchValue(c || { name: '', slug: '', description: '', image_url: '', sort_order: 0, parent_id: null, is_active: true });
    this.showForm = true;
  }

  save(): void {
    const obs = this.editing
      ? this.api.put('/admin/categories/' + this.editing.id, this.form.value)
      : this.api.post('/admin/categories', this.form.value);
    obs.subscribe({
      next: () => {
        this.toast.success(this.editing ? 'Category updated.' : 'Category created.');
        this.showForm = false;
        this.load();
        this.cdr.detectChanges();
      },
    });
  }

  deleteCategory(c: Category): void {
    if (confirm(`Delete "${c.name}"?`)) {
      this.api.delete('/admin/categories/' + c.id).subscribe(() => {
        this.load();
        this.cdr.detectChanges();
      });
    }
  }
}
