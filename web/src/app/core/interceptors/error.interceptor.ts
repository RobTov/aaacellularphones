import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private toast: ToastService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        let msg = 'An unexpected error occurred.';
        if (err.error?.error) {
          msg = err.error.error;
        } else if (err.error?.message) {
          msg = err.error.message;
        } else if (err.message) {
          msg = err.message;
        }
        if (err.status === 401) {
          this.auth.logout();
          msg = 'Session expired. Please login again.';
        }
        this.toast.error(msg);
        return throwError(() => err);
      }),
    );
  }
}
