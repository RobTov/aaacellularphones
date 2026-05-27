import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: false,
  template: `
    <div class="container" style="max-width: 420px; margin-top: 64px;">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Create Account</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width mt-2">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="first_name">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="last_name">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email">
              <mat-error *ngIf="form.get('email')?.hasError('required')">Required</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Invalid email</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password">
              <mat-error *ngIf="form.get('password')?.hasError('required')">Required</mat-error>
              <mat-error *ngIf="form.get('password')?.hasError('minlength')">Min 6 characters</mat-error>
            </mat-form-field>
            <button mat-raised-button color="primary" class="full-width" type="submit" [disabled]="form.invalid || loading">
              {{ loading ? 'Creating...' : 'Create Account' }}
            </button>
          </form>
          <p class="text-center mt-2">
            Already have an account? <a routerLink="/auth/login">Sign In</a>
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      first_name: [''],
      last_name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.register(this.form.value).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
