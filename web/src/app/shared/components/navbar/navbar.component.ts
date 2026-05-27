import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  template: `
    <nav class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <a routerLink="/" class="text-xl font-bold text-gray-900 tracking-tight">AAACellularPhones</a>
          </div>
          <div class="flex items-center gap-2">
            <a routerLink="/products" class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
              Shop
            </a>
            <a routerLink="/cart" class="relative px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
              <app-icon name="shopping_cart" size="20px"></app-icon>
              <span *ngIf="cart.itemCount() > 0"
                    class="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {{ cart.itemCount() }}
              </span>
            </a>
            <ng-container *ngIf="auth.isAuthenticated(); else guest">
              <a routerLink="/orders" class="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                My Orders
              </a>
              <a *ngIf="auth.isAdmin()" routerLink="/admin" class="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                Admin
              </a>
              <div class="relative" (click)="menuOpen = !menuOpen" (clickOutside)="menuOpen = false">
                <button class="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                  {{ auth.user()?.first_name || auth.user()?.email }}
                  <app-icon name="arrow_drop_down" size="16px"></app-icon>
                </button>
                <div *ngIf="menuOpen" class="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <a routerLink="/orders" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" (click)="menuOpen = false">My Orders</a>
                  <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" (click)="auth.logout(); menuOpen = false">Sign Out</button>
                </div>
              </div>
            </ng-container>
            <ng-template #guest>
              <a routerLink="/auth/login" class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                Sign In
              </a>
              <a routerLink="/auth/register" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                Register
              </a>
            </ng-template>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class NavbarComponent {
  menuOpen = false;

  constructor(
    public auth: AuthService,
    public cart: CartService,
  ) {}
}
