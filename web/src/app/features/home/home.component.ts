import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../shared/models/product.model';
import { CartService } from '../../core/services/cart.service';

interface Testimonial {
  name: string;
  text: string;
  stars: number;
  date: string;
  avatar: string;
}

@Component({
  selector: 'app-home',
  standalone: false,
  template: `
    <!-- Hero -->
    <section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900"></div>
      <div class="absolute inset-0 opacity-40 overflow-hidden pointer-events-none">
        <iframe
          src="https://player.vimeo.com/video/1015033420?h=3c22884d35&autoplay=1&loop=1&autopause=0&muted=1&title=0&byline=0&portrait=0&controls=0"
          class="absolute w-[300%] h-[300%] min-w-[100vw] min-h-[100vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style="transform: translate(-50%, -50%) scale(0.5);"
          allow="autoplay; fullscreen"
          frameborder="0"
          title="Background Video">
        </iframe>
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
      <div class="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-20">
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 tracking-tight">
          AAA CELLULAR<br>
          <span class="text-blue-400">ARLINGTON PHONE STORE</span>
        </h1>
        <p class="text-lg sm:text-xl md:text-2xl text-gray-200 font-semibold mb-10 max-w-2xl mx-auto">
          WE BUY / SELL / REPAIR / UNLOCK ALL CELLPHONES
        </p>
        <a href="tel:+18174044096"
           class="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold text-white bg-green-600 hover:bg-green-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
          Call / Text: +1 (817) 404-4096
        </a>
      </div>
    </section>

    <!-- New Products -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">New Products</h2>
        <p class="text-gray-600 max-w-xl mx-auto">Check out our latest arrivals</p>
      </div>
      <div *ngIf="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div *ngFor="let _ of [1,2,3,4]" class="loading-shimmer h-96 rounded-xl"></div>
      </div>
      <div *ngIf="!loading && products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-product-card *ngFor="let p of products" [product]="p" (add)="addToCart($event)"></app-product-card>
      </div>
      <div *ngIf="!loading && products.length === 0" class="text-center py-12 text-gray-500">
        No products available yet.
      </div>
      <div class="text-center mt-10">
        <a routerLink="/products"
           class="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 hover:shadow-lg">
          View All Products
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </a>
      </div>
    </section>

    <!-- Partners -->
    <section class="bg-gray-50 py-16 sm:py-20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Choose from our partners!</h2>
          <p class="text-gray-600 max-w-xl mx-auto">Get financed through our trusted partners</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start max-w-3xl mx-auto">
          <div class="text-center">
            <div class="w-56 h-56 mx-auto rounded-full overflow-hidden border-4 border-blue-200 shadow-lg mb-5">
              <img src="/assets/partner1.jpeg" alt="PROGRESSIVE" class="w-full h-full object-cover">
            </div>
            <p class="text-xl font-bold text-gray-900 mb-4">PROGRESSIVE</p>
            <a href="https://approve.me/s/aaacellular/81918#/app" target="_blank" rel="noopener"
               class="inline-flex px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 hover:shadow-md">
              APPLY FOR PROGRESSIVE
            </a>
          </div>
          <div class="text-center">
            <div class="w-56 h-56 mx-auto rounded-full overflow-hidden border-4 border-blue-200 shadow-lg mb-5">
              <img src="/assets/partner2.jpeg" alt="ACIMA" class="w-full h-full object-cover">
            </div>
            <p class="text-xl font-bold text-gray-900 mb-4">ACIMA</p>
            <a href="https://ams.acimacredit.com/discover/new?utm_campaign=merchant&utm_source=web&location_guid=loca-1cfe9773-61af-4c7a-b00d-dd8f8443538e" target="_blank" rel="noopener"
               class="inline-flex px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 hover:shadow-md">
              APPLY FOR ACIMA
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Services: Unlocked iPhones -->
    <section class="py-16 sm:py-20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Unlocked iPhones Available!</h2>
        </div>
        <div class="mb-12 rounded-2xl overflow-hidden shadow-xl max-w-4xl mx-auto">
          <img src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&q=80"
               alt="iPhone" class="w-full h-80 sm:h-96 object-cover">
        </div>
        <div class="text-center mb-12">
          <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            A ONE STOP SOLUTION FOR ALL YOUR CELLULAR NEEDS!
          </h3>
          <p class="text-gray-600">We offer a wide range of services to keep you connected</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div class="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg class="w-20 h-20 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div class="p-5 text-center">
              <p class="text-lg font-bold text-gray-900">Instantly Unlocking All iPhones</p>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div class="h-48 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <svg class="w-20 h-20 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="p-5 text-center">
              <p class="text-lg font-bold text-gray-900">Consoles & More Electronics</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="bg-gray-50 py-16 sm:py-20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p class="text-gray-600 max-w-xl mx-auto">Real reviews from real customers</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div *ngFor="let t of testimonials" class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                {{ t.avatar }}
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ t.name }}</p>
                <p class="text-sm text-gray-500">{{ t.date }}</p>
              </div>
            </div>
            <div class="flex mb-3">
              <ng-container *ngFor="let _ of [].constructor(t.stars)">
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </ng-container>
            </div>
            <p class="text-gray-700 leading-relaxed">"{{ t.text }}"</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Progressive Leasing Disclosure -->
    <section class="py-12 sm:py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Progressive Leasing Disclosure</h2>
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 sm:p-8 text-sm text-gray-600 leading-relaxed">
          <p>The advertised service is lease-to-own or a rental- or lease- purchase agreement provided by Prog Leasing, LLC, or its affiliates. Acquiring ownership by leasing costs more than the retailer's cash price. Leasing available on select items at participating locations only. Not available in MN, NJ, VT, WI, WY.</p>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section class="bg-gray-900 text-white py-16 sm:py-20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">Contact Us</h2>
          <p class="text-gray-400 max-w-xl mx-auto">We'd love to hear from you</p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-white text-lg">Visit Us</p>
                  <p class="text-gray-400 mt-1">
                    <a href="https://maps.google.com/maps?q=1511+S+Bowen+Rd+Arlington+TX+76013" target="_blank" rel="noopener" class="hover:text-blue-400 transition-colors">
                      1511 S Bowen Rd<br>Arlington, TX 76013
                    </a>
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-white text-lg">Call / Text</p>
                  <a href="tel:+18174044096" class="text-gray-400 hover:text-blue-400 transition-colors mt-1 block">+1 (817) 404-4096</a>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-4 mt-10">
              <a href="https://www.facebook.com/AAACellularPhones/" target="_blank" rel="noopener"
                 class="w-12 h-12 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://x.com/i/flow/login?redirect_after_login=%2Fintent%2Ftweet%3Furl%3Dhttps%253A%252F%252Fgoo.gl%252Fmaps%252FswkD5TNcpDP2" target="_blank" rel="noopener"
                 class="w-12 h-12 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://www.yelp.com/biz/aaa-cellular-arlington" target="_blank" rel="noopener"
                 class="w-12 h-12 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-colors">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.271 14.695c-.39-.19-2.645-.922-2.645-.922l-4.876 7.036c1.396.583 2.923.597 4.398.128 1.476-.47 2.747-1.561 3.02-3.094.001 0 .105-3.083.105-3.148 0-.369-.57-.861-1.002-1zM20.38 6.272c-1.154-2.824-5.774-5.834-8.22-4.471-1.367.761-1.407 2.217-1.223 4.183l.03 1.418c.01.402.428.683.428.683l3.51 1.094c.222.09.455-.037.545-.254.089-.218 2.53-2.3 2.53-2.3.32-.285.582-.613.4-1.353zM9.504 11.991c-.25-.184-5.619-3.449-5.619-3.449-.276-.186-.642-.261-1.146-.059C1.283 8.99.389 10.619.118 12.374c-.271 1.755.043 3.081.847 3.882.801.801 1.886.691 2.681.686l3.197.168c.471.039.886-.236.886-.236.001 0 3.35-5.431 3.401-5.578.121-.382-.282-.852-.626-1.306z"/>
                </svg>
              </a>
            </div>
          </div>
          <div class="rounded-xl overflow-hidden border border-gray-700 shadow-lg h-80">
            <iframe
              title="Google Maps"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3354.8485025949114!2d-97.14886732423832!3d32.76821578503599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864e7c8f23f0b5cb%3A0x6b1a0b9f5e8e4e3f!2s1511%20S%20Bowen%20Rd%2C%20Arlington%2C%20TX%2076013!5e0!3m2!1sen!2sus!4v1"
              width="100%"
              height="100%"
              style="border:0;"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  loading = true;

  testimonials: Testimonial[] = [
    {
      name: 'Maria Gonzalez',
      text: 'Best phone repair in town! They fixed my iPhone screen in under an hour and the price was very reasonable. Highly recommend!',
      stars: 5,
      date: 'March 15, 2026',
      avatar: 'MG',
    },
    {
      name: 'James Thompson',
      text: 'Great selection of unlocked phones at fair prices. The staff was super helpful in finding exactly what I needed. Will definitely come back.',
      stars: 5,
      date: 'February 28, 2026',
      avatar: 'JT',
    },
    {
      name: 'Sarah Patel',
      text: 'I sold my old Samsung and got a great deal. The whole process was quick and easy. They also helped me transfer all my data to the new phone.',
      stars: 4,
      date: 'January 12, 2026',
      avatar: 'SP',
    },
  ];

  constructor(
    private api: ApiService,
    private cart: CartService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.getPaginated<Product>('/products', {
      sort_by: 'newest',
      sort_order: 'desc',
      page: 1,
      limit: 8,
    }).subscribe({
      next: r => {
        this.products = r.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  addToCart(product: Product): void {
    this.cart.add(product);
  }
}
