import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-cart',
  standalone: false,
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div *ngIf="cart.items().length === 0" class="text-center py-16">
        <app-icon name="shopping_cart" size="56px" class="text-gray-300"></app-icon>
        <p class="text-gray-500 mt-4 mb-6">Your cart is empty.</p>
        <a routerLink="/products" class="inline-flex px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          Browse Products
        </a>
      </div>

      <div *ngIf="cart.items().length > 0">
        <div class="space-y-3">
          <div *ngFor="let item of cart.items()" class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="flex items-center gap-4">
              <img [src]="item.image || 'assets/placeholder.svg'"
                   class="w-20 h-20 object-cover rounded-lg flex-shrink-0">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 truncate">{{ item.name }}</p>
                <p class="text-blue-600 font-semibold mt-0.5">\${{ item.price.toFixed(2) }}</p>
              </div>
              <div class="flex items-center border border-gray-300 rounded-lg">
                <button (click)="decrement(item)" [disabled]="item.quantity <= 1"
                        class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 transition-colors rounded-l-lg">
                  <app-icon name="remove" size="14px"></app-icon>
                </button>
                <span class="px-3 py-2 text-sm font-medium border-x border-gray-300 min-w-[40px] text-center">{{ item.quantity }}</span>
                <button (click)="increment(item)" [disabled]="item.quantity >= item.stock"
                        class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 transition-colors rounded-r-lg">
                  <app-icon name="add" size="14px"></app-icon>
                </button>
              </div>
              <div class="text-right min-w-[80px]">
                <p class="font-semibold text-gray-900">\${{ (item.price * item.quantity).toFixed(2) }}</p>
              </div>
              <button (click)="cart.remove(item.productId)"
                      class="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                <app-icon name="delete" size="18px"></app-icon>
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-6 mt-6">
          <div class="flex items-center justify-between mb-4">
            <span class="text-lg font-semibold text-gray-900">Total</span>
            <span class="text-2xl font-bold text-blue-600">\${{ cart.total().toFixed(2) }}</span>
          </div>
          <button (click)="checkout()" [disabled]="loading"
                  class="w-full py-3 px-6 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed rounded-lg transition-colors">
            {{ loading ? 'Processing...' : 'Proceed to Checkout' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CartComponent {
  loading = false;

  constructor(
    public cart: CartService,
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  increment(item: CartItem): void {
    this.cart.updateQuantity(item.productId, item.quantity + 1);
  }

  decrement(item: CartItem): void {
    this.cart.updateQuantity(item.productId, item.quantity - 1);
  }

  checkout(): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.warning('Please login to checkout.');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loading = true;
    const items = this.cart.items().map(i => ({ product_id: i.productId, quantity: i.quantity }));
    this.api.post<{ id: string }>('/orders', { items }).subscribe({
      next: order => {
        this.api.post<{ url: string }>('/payments/checkout', { order_id: order.id }).subscribe({
          next: res => {
            this.cart.clear();
            window.location.href = res.url;
          },
          error: () => {
            this.loading = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
