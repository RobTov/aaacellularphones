import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: PaginationMeta;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(
    private http: HttpClient,
  ) {}

  get<T>(path: string, params?: any): Observable<T> {
    return this.wrapOutside<T>(
      this.http.get<ApiResponse<T>>(`${this.base}${path}`, { params: this.buildParams(params) })
        .pipe(map(r => r.data)),
    );
  }

  post<T>(path: string, body?: any): Observable<T> {
    return this.wrapOutside<T>(
      this.http.post<ApiResponse<T>>(`${this.base}${path}`, body)
        .pipe(map(r => r.data)),
    );
  }

  put<T>(path: string, body?: any): Observable<T> {
    return this.wrapOutside<T>(
      this.http.put<ApiResponse<T>>(`${this.base}${path}`, body)
        .pipe(map(r => r.data)),
    );
  }

  delete<T>(path: string): Observable<T> {
    return this.wrapOutside<T>(
      this.http.delete<ApiResponse<T>>(`${this.base}${path}`)
        .pipe(map(r => r.data)),
    );
  }

  getPaginated<T>(path: string, params?: any): Observable<{ data: T[]; total: number; page: number; limit: number }> {
    return this.wrapOutside(
      this.http.get<ApiResponse<T[]>>(`${this.base}${path}`, { params: this.buildParams(params) })
        .pipe(map(r => ({
          data: r.data,
          total: r.meta?.total_items ?? 0,
          page: r.meta?.page ?? 1,
          limit: r.meta?.limit ?? 20,
        }))),
    );
  }

  private wrapOutside<T>(source: Observable<T>): Observable<T> {
    return new Observable<T>(subscriber => {
      const sub = source.subscribe({
        next: v => setTimeout(() => subscriber.next(v)),
        error: e => setTimeout(() => subscriber.error(e)),
      });
      return () => sub.unsubscribe();
    });
  }

  private buildParams(params?: any): HttpParams {
    let hp = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
          hp = hp.set(k, String(params[k]));
        }
      });
    }
    return hp;
  }
}
