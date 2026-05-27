import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AdminGuard } from '../../core/guards/admin.guard';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { AdminProductsComponent } from './products/products.component';
import { CategoriesComponent } from './categories/categories.component';
import { AdminOrdersComponent } from './orders/orders.component';
import { PaymentsComponent } from './payments/payments.component';
import { AdminReviewsComponent } from './reviews/reviews.component';
import { LogsComponent } from './logs/logs.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'reviews', component: AdminReviewsComponent },
      { path: 'logs', component: LogsComponent },
    ],
  },
];

@NgModule({
  declarations: [
    AdminLayoutComponent,
    DashboardComponent,
    UsersComponent,
    AdminProductsComponent,
    CategoriesComponent,
    AdminOrdersComponent,
    PaymentsComponent,
    AdminReviewsComponent,
    LogsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    IconComponent,
  ],
})
export class AdminModule {}
