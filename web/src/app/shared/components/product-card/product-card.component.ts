import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: false,
  template: `
    <mat-card [class.out-of-stock]="product.status === 'out_of_stock'" style="cursor:pointer; height: 100%; display: flex; flex-direction: column;"
      [routerLink]="['/products', product.slug]">
      <div style="position:relative;">
        <img [src]="product.images?.[0] || 'assets/placeholder.svg'"
             [alt]="product.name"
             style="width:100%; height:200px; object-fit:cover; border-radius:12px 12px 0 0;">
        <span *ngIf="product.compare_price"
              style="position:absolute;top:8px;left:8px;background:#f44336;color:#fff;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:600;">
          -{{ discount }}%
        </span>
        <span *ngIf="product.status === 'out_of_stock'"
              style="position:absolute;top:8px;right:8px;background:#757575;color:#fff;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:600;">
          Out of Stock
        </span>
      </div>
      <mat-card-content style="flex:1; padding:12px;">
        <div style="font-size:0.8rem;color:#666;margin-bottom:4px;">{{ product.category_name }}</div>
        <div style="font-weight:600;font-size:1rem;margin-bottom:8px;">{{ product.name }}</div>
        <div class="flex items-center gap-1">
          <span style="font-size:1.25rem;font-weight:700;color:#3f51b5;">\${{ product.price.toFixed(2) }}</span>
          <span *ngIf="product.compare_price" style="text-decoration:line-through;color:#999;font-size:0.875rem;">
            \${{ product.compare_price.toFixed(2) }}
          </span>
        </div>
      </mat-card-content>
      <mat-card-actions style="padding:8px 12px 12px;">
        <button mat-raised-button color="primary" class="full-width"
                [disabled]="product.status === 'out_of_stock' || product.stock === 0"
                (click)="$event.stopPropagation(); add.emit(product)">
          {{ product.status === 'out_of_stock' || product.stock === 0 ? 'Unavailable' : 'Add to Cart' }}
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .out-of-stock { opacity: 0.7; }
  `],
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() add = new EventEmitter<Product>();

  get discount(): number {
    if (!this.product.compare_price) return 0;
    return Math.round((1 - this.product.price / this.product.compare_price) * 100);
  }
}
