// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  signup(data: { first_name: string; last_name: string; email: string; password: string; password_confirmation: string; }) {
    return this.http.post<any>(`${environment.apiUrl}/users`, { user: data })
      .pipe(tap(res => this.storeToken(res.token)));
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/login`, { user: { email, password } })
      .pipe(tap(res => this.storeToken(res.token)));
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  storeToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
