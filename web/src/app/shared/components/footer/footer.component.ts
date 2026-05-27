import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: false,
  template: `
    <footer class="bg-gray-900 text-gray-300 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="text-center">
          <div class="text-lg font-semibold text-white mb-2">AAACellularPhones</div>
          <p class="text-sm text-gray-400">&copy; 2026 All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
