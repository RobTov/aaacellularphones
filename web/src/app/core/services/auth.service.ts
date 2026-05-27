import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthResponse, LoginInput, RegisterInput, User } from '../../shared/models/user.model';

export { AuthResponse };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  user = signal<User | null>(null);
  isAuthenticated = signal(false);
  isAdmin = signal(false);

  constructor(
    private api: ApiService,
    private router: Router,
  ) {
    this.loadUser();
  }

  register(input: RegisterInput): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', input).pipe(tap(r => this.setSession(r)));
  }

  login(input: LoginInput): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', input).pipe(tap(r => this.setSession(r)));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.user.set(null);
    this.isAuthenticated.set(false);
    this.isAdmin.set(false);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getProfile(): Observable<User> {
    return this.api.get<User>('/me');
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.api.put<User>('/me', data);
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.userKey, JSON.stringify(res.user));
    this.user.set(res.user);
    this.isAuthenticated.set(true);
    this.isAdmin.set(res.user.role === 'admin');
  }

  private loadUser(): void {
    const token = localStorage.getItem(this.tokenKey);
    const raw = localStorage.getItem(this.userKey);
    if (token && raw) {
      try {
        const user = JSON.parse(raw) as User;
        this.user.set(user);
        this.isAuthenticated.set(true);
        this.isAdmin.set(user.role === 'admin');
      } catch {
        this.logout();
      }
    }
  }
}
