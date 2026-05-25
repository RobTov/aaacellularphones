import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  template: `
    <mat-toolbar color="primary" style="position:sticky;top:0;z-index:100;">
      <div class="container flex items-center justify-between" style="padding:0 16px;">
        <div class="flex items-center gap-2">
          <button mat-icon-button *ngIf="auth.isAuthenticated()" class="menu-btn">
            <mat-icon>menu</mat-icon>
          </button>
          <a routerLink="/" style="text-decoration:none;color:#fff;font-weight:700;font-size:1.25rem;">AAACellularPhones</a>
        </div>
        <div class="flex items-center gap-1">
          <a mat-button routerLink="/products">Shop</a>
          <a mat-button routerLink="/cart">
            <mat-icon>shopping_cart</mat-icon>
            <span *ngIf="cart.itemCount() > 0" class="cart-badge">{{ cart.itemCount() }}</span>
          </a>
          <ng-container *ngIf="auth.isAuthenticated(); else guest">
            <a mat-button routerLink="/orders">My Orders</a>
            <a mat-button *ngIf="auth.isAdmin()" routerLink="/admin">Admin</a>
            <button mat-button [matMenuTriggerFor]="menu">
              {{ auth.user()?.first_name || auth.user()?.email }}
              <mat-icon>arrow_drop_down</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item routerLink="/orders">My Orders</button>
              <button mat-menu-item (click)="auth.logout()">Sign Out</button>
            </mat-menu>
          </ng-container>
          <ng-template #guest>
            <a mat-button routerLink="/auth/login">Sign In</a>
            <a mat-raised-button routerLink="/auth/register" style="background:#fff;color:#3f51b5;">Register</a>
          </ng-template>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .cart-badge {
      background: #f44336; color: #fff; border-radius: 50%;
      padding: 2px 6px; font-size: 0.7rem; font-weight: 700;
      position: absolute; top: 4px; right: -4px;
    }
    .menu-btn { display: none; }
    @media (max-width: 768px) {
      .menu-btn { display: inline-flex; }
      a mat-icon { margin-right: 4px; }
    }
  `],
})
export class NavbarComponent {
  constructor(
    public auth: AuthService,
    public cart: CartService,
  ) {}
}
