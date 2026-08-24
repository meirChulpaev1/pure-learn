import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthTokens, LoginPayload, RegisterPayload } from '../models/auth.model';
import { User } from '../models/user.model';

const ACCESS_KEY = 'sg_access_token';
const REFRESH_KEY = 'sg_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  // --- state as signals -----------------------------------------------
  private _accessToken = signal<string | null>(localStorage.getItem(ACCESS_KEY));
  private _refreshToken = signal<string | null>(localStorage.getItem(REFRESH_KEY));
  private _currentUser = signal<User | null>(null);

  readonly accessToken = this._accessToken.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._accessToken() !== null);

  constructor() {
    // רענון עמוד (F5): הטוקן כבר קיים ב-localStorage, אבל currentUser עוד ריק בזיכרון.
    // טוענים אותו מיד כדי שה-UI (למשל שם המשתמש ב-navbar) יתעדכן.
    // אם הטוקן פג תוקף, ה-interceptor כבר ידאג לרענון או להתנתקות אוטומטית.
    if (this._accessToken()) {
      this.loadCurrentUser().subscribe({ error: () => undefined });
    }
  }

  // --- auth flows --------------------------------------------------------

  register(payload: RegisterPayload): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/auth/register/`, payload);
  }

  /** מתחבר, שומר את הטוקנים, ואז טוען את פרטי המשתמש המחובר (/auth/me/). */
  login(payload: LoginPayload): Observable<User> {
    return this.http.post<AuthTokens>(`${this.baseUrl}/auth/login/`, payload).pipe(
      tap((tokens) => this.setTokens(tokens)),
      switchMap(() => this.loadCurrentUser()),
    );
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/auth/me/`).pipe(
      tap((user) => this._currentUser.set(user)),
    );
  }

  refreshAccessToken(): Observable<{ access: string }> {
    const refresh = this._refreshToken();
    return this.http.post<{ access: string }>(`${this.baseUrl}/auth/refresh/`, { refresh }).pipe(
      tap((res) => {
        this._accessToken.set(res.access);
        localStorage.setItem(ACCESS_KEY, res.access);
      }),
    );
  }

  logout(): void {
    const refresh = this._refreshToken();
    if (refresh) {
      // best-effort: מבקשים מהשרת להכניס את ה-refresh token ל-blacklist.
      // לא ממתינים לתשובה — הניקוי המקומי קורה מיד בכל מקרה.
      this.http.post(`${this.baseUrl}/auth/logout/`, { refresh }).subscribe({
        error: () => undefined,
      });
    }
    this.clearTokens();
  }

  getRefreshToken(): string | null {
    return this._refreshToken();
  }

  setTokens(tokens: AuthTokens): void {
    this._accessToken.set(tokens.access);
    this._refreshToken.set(tokens.refresh);
    localStorage.setItem(ACCESS_KEY, tokens.access);
    localStorage.setItem(REFRESH_KEY, tokens.refresh);
  }

  clearTokens(): void {
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._currentUser.set(null);
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
}
