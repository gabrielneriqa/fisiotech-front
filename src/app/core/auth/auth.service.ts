import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CurrentUser } from './current-user';

const STORAGE_KEY = 'fisiotech.auth.credentials';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly currentUserSignal = signal<CurrentUser | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  login(email: string, senha: string): Observable<CurrentUser> {
    const credentials = this.encodeCredentials(email, senha);

    return this.http
      .get<CurrentUser>(`${environment.apiUrl}/auth/me`, {
        headers: { Authorization: `Basic ${credentials}` },
      })
      .pipe(
        tap((user) => {
          sessionStorage.setItem(STORAGE_KEY, credentials);
          this.currentUserSignal.set(user);
        }),
      );
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.currentUserSignal.set(null);
  }

  /** Tenta restaurar a sessão a partir das credenciais salvas (ex: após um refresh da página). */
  restoreSession(): Observable<CurrentUser> | null {
    const credentials = this.getStoredCredentials();
    if (!credentials) {
      return null;
    }

    return this.http
      .get<CurrentUser>(`${environment.apiUrl}/auth/me`, {
        headers: { Authorization: `Basic ${credentials}` },
      })
      .pipe(tap((user) => this.currentUserSignal.set(user)));
  }

  getStoredCredentials(): string | null {
    return sessionStorage.getItem(STORAGE_KEY);
  }

  private encodeCredentials(email: string, senha: string): string {
    return btoa(`${email}:${senha}`);
  }
}
