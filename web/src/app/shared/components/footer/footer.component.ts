import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: false,
  template: `
    <footer style="background:#3f51b5;color:#fff;padding:24px 0;margin-top:48px;">
      <div class="container text-center" style="font-size:0.875rem;">
        <div style="font-weight:600;margin-bottom:8px;">AAACellularPhones</div>
        <div style="opacity:0.8;">&copy; 2026 All rights reserved.</div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
