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
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Categories</h1>
        <button (click)="openForm()"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          <app-icon name="plus" size="16px"></app-icon>
          New Category
        </button>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Slug</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Order</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Active</th>
                <th class="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of categories" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-900">{{ c.name }}</td>
                <td class="px-6 py-4 text-gray-600">{{ c.slug }}</td>
                <td class="px-6 py-4">{{ c.sort_order }}</td>
                <td class="px-6 py-4">
                  <app-icon [name]="c.is_active ? 'check_circle' : 'cancel'"
                            [color]="c.is_active ? '#22c55e' : '#ef4444'" size="18px">
                  </app-icon>
                </td>
                <td class="px-6 py-4 text-right">
                  <button (click)="openForm(c)" class="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    <app-icon name="edit" size="16px"></app-icon>
                  </button>
                  <button (click)="deleteCategory(c)" class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors ml-1">
                    <app-icon name="delete" size="16px"></app-icon>
                  </button>
                </td>
              </tr>
              <tr *ngIf="categories.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-400">No categories found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Form Overlay -->
      <div *ngIf="showForm" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" (click)="showForm = false"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">{{ editing ? 'Edit' : 'New' }} Category</h2>
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
              <textarea formControlName="description" rows="2"
                        class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
              <input type="text" formControlName="image_url"
                     class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                <input type="number" formControlName="sort_order"
                       class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Parent Category</label>
                <select formControlName="parent_id"
                        class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                  <option [value]="null">None</option>
                  <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="showForm = false"
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit"
                      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                {{ editing ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
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
