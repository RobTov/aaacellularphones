import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<CartItem[]>([]);
  itemCount = signal(0);
  total = signal(0);

  private storageKey = 'cart_items';

  constructor(
    private auth: AuthService,
    private toast: ToastService,
    private router: Router,
  ) {
    this.load();
  }

  add(product: { id: string; name: string; images: string[]; price: number; stock: number }): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.warning('You must be logged in to add products to the cart.');
      this.router.navigate(['/auth/login']);
      return;
    }
    const current = this.items();
    const existing = current.find(i => i.productId === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      current.push({
        productId: product.id,
        name: product.name,
        image: product.images?.[0] || '',
        price: product.price,
        quantity: 1,
        stock: product.stock,
      });
    }
    this.items.set([...current]);
    this.save();
    this.toast.success(`${product.name} added to cart.`);
  }

  remove(productId: string): void {
    this.items.set(this.items().filter(i => i.productId !== productId));
    this.save();
  }

  updateQuantity(productId: string, qty: number): void {
    const current = this.items();
    const item = current.find(i => i.productId === productId);
    if (item) {
      item.quantity = Math.max(1, Math.min(qty, item.stock));
      this.items.set([...current]);
      this.save();
    }
  }

  clear(): void {
    this.items.set([]);
    this.itemCount.set(0);
    this.total.set(0);
    localStorage.removeItem(this.storageKey);
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const items = JSON.parse(raw) as CartItem[];
        this.items.set(items);
      }
    } catch {}
    this.updateCounters();
  }

  private save(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items()));
    this.updateCounters();
  }

  private updateCounters(): void {
    const all = this.items();
    this.itemCount.set(all.reduce((s, i) => s + i.quantity, 0));
    this.total.set(all.reduce((s, i) => s + i.price * i.quantity, 0));
  }
}
