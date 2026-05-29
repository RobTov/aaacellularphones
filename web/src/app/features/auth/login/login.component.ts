import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  template: `
    <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-sm">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 class="text-2xl font-bold text-gray-900 text-center mb-8">Sign In</h1>
          <div *ngIf="errorMessage"
               class="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5">
            <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm text-red-700">{{ errorMessage }}</p>
          </div>
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" formControlName="email" placeholder="you@example.com"
                     class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder:text-gray-400">
              <p *ngIf="form.get('email')?.touched && form.get('email')?.hasError('required')" class="mt-1 text-xs text-red-500">Required</p>
              <p *ngIf="form.get('email')?.touched && form.get('email')?.hasError('email')" class="mt-1 text-xs text-red-500">Invalid email</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" formControlName="password"
                     class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
              <p *ngIf="form.get('password')?.touched && form.get('password')?.hasError('required')" class="mt-1 text-xs text-red-500">Required</p>
              <p *ngIf="form.get('password')?.touched && form.get('password')?.hasError('minlength')" class="mt-1 text-xs text-red-500">Min 6 characters</p>
            </div>
            <button type="submit" [disabled]="form.invalid || loading"
                    class="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed rounded-lg transition-colors">
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>
          <p class="text-center text-sm text-gray-500 mt-6">
            Don't have an account? <a routerLink="/auth/register" class="text-blue-600 hover:text-blue-700 font-medium">Register</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || err.error?.message || 'Invalid email or password. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }
}
