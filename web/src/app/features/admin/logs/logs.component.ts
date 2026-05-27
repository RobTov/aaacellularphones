import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Log } from '../../../shared/models/log.model';

@Component({
  selector: 'app-logs',
  standalone: false,
  template: `
    <div>
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <button (click)="load(1)"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <app-icon name="refresh" size="16px"></app-icon>
          Refresh
        </button>
      </div>
      <p class="text-sm text-gray-500 mb-4">Immutable audit trail — logs are auto-inserted by database triggers and cannot be modified.</p>

      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-6 py-3 font-medium text-gray-500">ID</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Table</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Action</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Record ID</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">User</th>
                <th class="text-left px-6 py-3 font-medium text-gray-500">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let l of logs" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-mono text-xs text-gray-900">{{ l.id | slice:0:8 }}...</td>
                <td class="px-6 py-4">
                  <span class="inline-flex px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-md">{{ l.table_name }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex px-2 py-0.5 text-xs font-semibold rounded-md"
                        [style.background]="l.action === 'INSERT' ? '#f0fdf4' : l.action === 'UPDATE' ? '#fffbeb' : '#fef2f2'"
                        [style.color]="l.action === 'INSERT' ? '#16a34a' : l.action === 'UPDATE' ? '#d97706' : '#dc2626'">
                    {{ l.action }}
                  </span>
                </td>
                <td class="px-6 py-4 font-mono text-xs text-gray-900">{{ l.record_id | slice:0:8 }}...</td>
                <td class="px-6 py-4 text-gray-600 text-xs">{{ l.user_id ? (l.user_id | slice:0:8) + '...' : 'System' }}</td>
                <td class="px-6 py-4 text-gray-500 text-xs">{{ l.created_at | date:'medium' }}</td>
              </tr>
              <tr *ngIf="logs.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-400">No logs found.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <span class="text-sm text-gray-500">Total: {{ total }}</span>
          <div class="flex gap-2">
            <button (click)="load(currentPage - 1)" [disabled]="currentPage <= 1"
                    class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <button (click)="load(currentPage + 1)" [disabled]="logs.length < 20"
                    class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LogsComponent implements OnInit {
  logs: Log[] = [];
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
    this.api.getPaginated<Log>('/admin/logs', { page }).subscribe({
      next: r => {
        this.logs = r.data;
        this.total = r.total;
        this.cdr.detectChanges();
      },
    });
  }
}
