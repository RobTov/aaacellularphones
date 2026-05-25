import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: false,
  template: `
    <div class="container text-center" style="margin-top:64px;">
      <mat-icon style="font-size:64px;color:#4caf50;">check_circle</mat-icon>
      <h1 style="font-weight:600;">Payment Successful!</h1>
      <p style="color:#666;">Your order has been placed. You will receive a confirmation email shortly.</p>
      <button mat-raised-button color="primary" routerLink="/orders">View My Orders</button>
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
