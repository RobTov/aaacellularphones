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
    <div class="container" style="max-width:800px;">
      <h1 style="font-weight:600;">Shopping Cart</h1>

      <div *ngIf="cart.items().length === 0" class="text-center mt-4">
        <mat-icon style="font-size:64px;color:#ccc;">shopping_cart</mat-icon>
        <p style="color:#666;">Your cart is empty.</p>
        <button mat-raised-button color="primary" routerLink="/products">Browse Products</button>
      </div>

      <div *ngIf="cart.items().length > 0">
        <mat-card *ngFor="let item of cart.items()" style="margin-bottom:12px;padding:12px;">
          <div class="flex items-center gap-2">
            <img [src]="item.image || 'assets/placeholder.svg'" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">
            <div style="flex:1;">
              <div style="font-weight:600;">{{ item.name }}</div>
              <div style="color:#3f51b5;font-weight:700;">\${{ item.price.toFixed(2) }}</div>
            </div>
            <button mat-icon-button (click)="decrement(item)" [disabled]="item.quantity <= 1">
              <mat-icon>remove</mat-icon>
            </button>
            <span style="font-weight:600;min-width:24px;text-align:center;">{{ item.quantity }}</span>
            <button mat-icon-button (click)="increment(item)" [disabled]="item.quantity >= item.stock">
              <mat-icon>add</mat-icon>
            </button>
            <div style="min-width:80px;text-align:right;font-weight:700;">
              \${{ (item.price * item.quantity).toFixed(2) }}
            </div>
            <button mat-icon-button color="warn" (click)="cart.remove(item.productId)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </mat-card>

        <mat-card style="padding:16px;margin-top:16px;">
          <div class="flex items-center justify-between">
            <span style="font-size:1.25rem;font-weight:600;">Total:</span>
            <span style="font-size:1.5rem;font-weight:700;color:#3f51b5;">\${{ cart.total().toFixed(2) }}</span>
          </div>
          <button mat-raised-button color="primary" class="full-width mt-2" size="large"
                  (click)="checkout()" [disabled]="loading">
            {{ loading ? 'Processing...' : 'Proceed to Checkout' }}
          </button>
        </mat-card>
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
