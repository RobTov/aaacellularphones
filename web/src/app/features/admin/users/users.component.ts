import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: false,
  template: `
    <div>
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Users</h1>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-6 py-3 font-medium text-gray-500">Email</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Role</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Active</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Joined</th>
                <th class="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-900">{{ u.email }}</td>
                <td class="px-6 py-4 text-gray-600">{{ u.first_name }} {{ u.last_name }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex px-2.5 py-0.5 text-xs font-medium text-white rounded-full"
                        [style.background]="u.role === 'admin' ? '#6366f1' : '#64748b'">
                    {{ u.role }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <app-icon [name]="u.is_active ? 'check_circle' : 'cancel'"
                            [color]="u.is_active ? '#22c55e' : '#ef4444'" size="18px">
                  </app-icon>
                </td>
                <td class="px-6 py-4 text-gray-500 text-xs">{{ u.created_at | date }}</td>
                <td class="px-6 py-4 text-right">
                  <button (click)="deleteUser(u)" [disabled]="u.role === 'admin'"
                          class="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-red-50 transition-colors">
                    <app-icon name="delete" size="16px"></app-icon>
                  </button>
                </td>
              </tr>
              <tr *ngIf="users.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-400">No users found.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <span class="text-sm text-gray-500">Total: {{ total }}</span>
          <div class="flex gap-2">
            <button (click)="load(currentPage - 1)" [disabled]="currentPage <= 1"
                    class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <button (click)="load(currentPage + 1)" [disabled]="users.length < 20"
                    class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  total = 0;
  currentPage = 1;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load(1);
  }

  load(page: number): void {
    this.currentPage = page;
    this.api.getPaginated<User>('/admin/users', { page }).subscribe({
      next: r => {
        this.users = r.data;
        this.total = r.total;
        this.cdr.detectChanges();
      },
    });
  }

  deleteUser(u: User): void {
    if (confirm(`Delete user ${u.email}?`)) {
      this.api.delete('/admin/users/' + u.id).subscribe(() => {
        this.load(1);
        this.cdr.detectChanges();
      });
    }
  }
}
