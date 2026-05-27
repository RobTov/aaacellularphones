import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-admin-layout',
  template: `
    <div class="flex min-h-[calc(100vh-4rem)]">
      <!-- Sidebar -->
      <aside class="w-60 bg-white border-r border-gray-200 flex-shrink-0 hidden lg:block">
        <nav class="py-4">
          <a *ngFor="let link of navLinks" [routerLink]="link.path" routerLinkActive="active-link"
             class="flex items-center gap-3 px-5 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            <app-icon [name]="link.icon" size="18px" class="flex-shrink-0"></app-icon>
            {{ link.label }}
          </a>
        </nav>
      </aside>

      <!-- Mobile Nav -->
      <div class="lg:hidden border-b border-gray-200 bg-white px-4 py-3 flex gap-2 overflow-x-auto">
        <a *ngFor="let link of navLinks" [routerLink]="link.path" routerLinkActive="active-link"
           class="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
          {{ link.label }}
        </a>
      </div>

      <!-- Content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .active-link {
      background-color: #eff6ff !important;
      color: #2563eb !important;
      font-weight: 600;
    }
  `],
})
export class AdminLayoutComponent {
  navLinks = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/users', icon: 'people', label: 'Users' },
    { path: '/admin/products', icon: 'inventory_2', label: 'Products' },
    { path: '/admin/categories', icon: 'category', label: 'Categories' },
    { path: '/admin/orders', icon: 'receipt_long', label: 'Orders' },
    { path: '/admin/payments', icon: 'payments', label: 'Payments' },
    { path: '/admin/reviews', icon: 'star', label: 'Reviews' },
    { path: '/admin/logs', icon: 'history', label: 'Logs' },
  ];
}
