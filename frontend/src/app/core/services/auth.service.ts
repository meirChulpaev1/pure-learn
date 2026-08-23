import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  User,
} from '../models/user.model';

const ACCESS_KEY = 'sg_access_token';
const REFRESH_KEY = 'sg_refresh_token';

/**
 * שומר טוקנים ב-sessionStorage (נמחקים בסגירת הטאב) — פשרה סבירה לפיתוח.
 * בפרודקשן עדיף refresh token ב-HttpOnly cookie כדי לצמצם חשיפה ל-XSS (ראו מסמך התכנון סעיף 11).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/auth`;

  private readonly accessTokenSignal = signal<string | null>(sessionStorage.getItem(ACCESS_KEY));
  private readonly refreshTokenSignal = signal<string | null>(sessionStorage.getItem(REFRESH_KEY));
  readonly currentUser = signal<User | null>(null);

  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.accessTokenSignal());

  register(payload: RegisterPayload): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/register/`, payload);
  }

  login(payload: LoginPayload): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.baseUrl}/login/`, payload).pipe(
      tap((tokens) => this.setTokens(tokens)),
      tap(() => this.loadCurrentUser().subscribe()),
    );
  }

  loadCurrentUser(): Observable<User | null> {
    if (!this.isLoggedIn()) return of(null);
    return this.http.get<User>(`${this.baseUrl}/me/`).pipe(
      tap((user) => this.currentUser.set(user)),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      }),
    );
  }

  refreshAccessToken(): Observable<{ access: string } | null> {
    const refresh = this.refreshTokenSignal();
    if (!refresh) return of(null);
    return this.http.post<{ access: string }>(`${this.baseUrl}/refresh/`, { refresh }).pipe(
      tap(({ access }) => {
        this.accessTokenSignal.set(access);
        sessionStorage.setItem(ACCESS_KEY, access);
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  logout(): void {
    const refresh = this.refreshTokenSignal();
    if (refresh) {
      this.http.post(`${this.baseUrl}/logout/`, { refresh }).subscribe({
        // גם אם קריאת ה-logout נכשלת (לדוגמה טוקן שכבר פג), עדיין מנקים מקומית.
        complete: () => this.clearSession(),
        error: () => this.clearSession(),
      });
    } else {
      this.clearSession();
    }
  }

  getRefreshToken(): string | null {
    return this.refreshTokenSignal();
  }

  private setTokens(tokens: AuthTokens): void {
    this.accessTokenSignal.set(tokens.access);
    this.refreshTokenSignal.set(tokens.refresh);
    sessionStorage.setItem(ACCESS_KEY, tokens.access);
    sessionStorage.setItem(REFRESH_KEY, tokens.refresh);
  }

  private clearSession(): void {
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.currentUser.set(null);
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  }
}
