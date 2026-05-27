import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: false,
  template: `
    <div [class.opacity-70]="product.status === 'out_of_stock'"
         class="group bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-300 cursor-pointer flex flex-col h-full"
         [routerLink]="['/products', product.slug]">
      <div class="relative overflow-hidden">
        <img [src]="product.images[0] || 'assets/placeholder.svg'"
             [alt]="product.name"
             class="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300">
        <span *ngIf="product.compare_price"
              class="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
          -{{ discount }}%
        </span>
        <span *ngIf="product.status === 'out_of_stock'"
              class="absolute top-3 right-3 bg-gray-600 text-white text-xs font-medium px-2 py-1 rounded-md">
          Out of Stock
        </span>
      </div>
      <div class="flex flex-col flex-1 p-4">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{{ product.category_name }}</p>
        <h3 class="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{{ product.name }}</h3>
        <div class="flex items-center gap-2 mb-3">
          <span class="text-lg font-bold text-blue-600">\${{ product.price.toFixed(2) }}</span>
          <span *ngIf="product.compare_price" class="text-sm text-gray-400 line-through">
            \${{ product.compare_price.toFixed(2) }}
          </span>
        </div>
        <div class="mt-auto">
          <button
            class="w-full py-2 px-4 text-sm font-medium rounded-lg transition-colors duration-200"
            [class]="(product.status === 'out_of_stock' || product.stock === 0)
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'"
            [disabled]="product.status === 'out_of_stock' || product.stock === 0"
            (click)="$event.stopPropagation(); add.emit(product)">
            {{ product.status === 'out_of_stock' || product.stock === 0 ? 'Unavailable' : 'Add to Cart' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() add = new EventEmitter<Product>();

  get discount(): number {
    if (!this.product.compare_price) return 0;
    return Math.round((1 - this.product.price / this.product.compare_price) * 100);
  }
}
