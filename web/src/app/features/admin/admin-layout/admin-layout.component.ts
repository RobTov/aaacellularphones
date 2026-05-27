import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-admin-layout',
  template: `
    <div style="display:flex;min-height:calc(100vh - 64px);">
      <nav style="width:240px;background:#fff;border-right:2px solid #e0e0e0;flex-shrink:0;padding:16px 0;">
        <a routerLink="/admin/dashboard" routerLinkActive="active"
           style="display:flex;align-items:center;gap:12px;padding:14px 24px;text-decoration:none;color:#333;font-size:0.95rem;">
          <mat-icon style="font-size:22px;width:22px;height:22px;">dashboard</mat-icon>
          Dashboard
        </a>
        <a routerLink="/admin/users" routerLinkActive="active"
           style="display:flex;align-items:center;gap:12px;padding:14px 24px;text-decoration:none;color:#333;font-size:0.95rem;">
          <mat-icon style="font-size:22px;width:22px;height:22px;">people</mat-icon>
          Users
        </a>
        <a routerLink="/admin/products" routerLinkActive="active"
           style="display:flex;align-items:center;gap:12px;padding:14px 24px;text-decoration:none;color:#333;font-size:0.95rem;">
          <mat-icon style="font-size:22px;width:22px;height:22px;">inventory_2</mat-icon>
          Products
        </a>
        <a routerLink="/admin/categories" routerLinkActive="active"
           style="display:flex;align-items:center;gap:12px;padding:14px 24px;text-decoration:none;color:#333;font-size:0.95rem;">
          <mat-icon style="font-size:22px;width:22px;height:22px;">category</mat-icon>
          Categories
        </a>
        <a routerLink="/admin/orders" routerLinkActive="active"
           style="display:flex;align-items:center;gap:12px;padding:14px 24px;text-decoration:none;color:#333;font-size:0.95rem;">
          <mat-icon style="font-size:22px;width:22px;height:22px;">receipt_long</mat-icon>
          Orders
        </a>
        <a routerLink="/admin/payments" routerLinkActive="active"
           style="display:flex;align-items:center;gap:12px;padding:14px 24px;text-decoration:none;color:#333;font-size:0.95rem;">
          <mat-icon style="font-size:22px;width:22px;height:22px;">payments</mat-icon>
          Payments
        </a>
        <a routerLink="/admin/reviews" routerLinkActive="active"
           style="display:flex;align-items:center;gap:12px;padding:14px 24px;text-decoration:none;color:#333;font-size:0.95rem;">
          <mat-icon style="font-size:22px;width:22px;height:22px;">star</mat-icon>
          Reviews
        </a>
        <a routerLink="/admin/logs" routerLinkActive="active"
           style="display:flex;align-items:center;gap:12px;padding:14px 24px;text-decoration:none;color:#333;font-size:0.95rem;">
          <mat-icon style="font-size:22px;width:22px;height:22px;">history</mat-icon>
          Logs
        </a>
      </nav>
      <main style="flex:1;padding:24px;background:#f5f5f5;">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .active {
      background: #e8eaf6 !important;
      color: #3f51b5 !important;
      font-weight: 600;
    }
  `],
})
export class AdminLayoutComponent {}
