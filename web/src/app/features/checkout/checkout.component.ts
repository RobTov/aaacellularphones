import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: false,
  template: `
    <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div class="text-center max-w-md">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <app-icon name="check_circle" size="32px" class="text-green-600"></app-icon>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
        <p class="text-gray-500 mb-8">Your order has been placed. You will receive a confirmation email shortly.</p>
        <a routerLink="/orders" class="inline-flex px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          View My Orders
        </a>
      </div>
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    if (sessionId) {
      // Backend webhook already handled the confirmation
    }
  }
}
