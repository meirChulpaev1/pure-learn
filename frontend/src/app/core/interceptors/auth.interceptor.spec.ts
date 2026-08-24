import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: {
    accessToken: () => string | null;
    getRefreshToken: () => string | null;
    refreshAccessToken: ReturnType<typeof vi.fn>;
    clearTokens: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(() => {
    authServiceMock = {
      accessToken: vi.fn(() => 'initial-access-token'),
      getRefreshToken: vi.fn(() => 'refresh-token'),
      refreshAccessToken: vi.fn(),
      clearTokens: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('attaches the Bearer token to outgoing API requests', () => {
    http.get(`${environment.apiBaseUrl}/groups/my-teaching/`).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/groups/my-teaching/`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer initial-access-token');
    req.flush([]);
  });

  it('does not attach a token to the login endpoint', () => {
    http.post(`${environment.apiBaseUrl}/auth/login/`, {}).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login/`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('on 401, refreshes the token once and retries the original request', () => {
    authServiceMock.refreshAccessToken.mockReturnValue(of({ access: 'new-access-token' }));

    let finalResult: unknown;
    http.get(`${environment.apiBaseUrl}/groups/my-teaching/`).subscribe((res) => (finalResult = res));

    const firstReq = httpMock.expectOne(`${environment.apiBaseUrl}/groups/my-teaching/`);
    expect(firstReq.request.headers.get('Authorization')).toBe('Bearer initial-access-token');
    firstReq.flush({ detail: 'Token expired' }, { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.refreshAccessToken).toHaveBeenCalled();

    const retriedReq = httpMock.expectOne(`${environment.apiBaseUrl}/groups/my-teaching/`);
    expect(retriedReq.request.headers.get('Authorization')).toBe('Bearer new-access-token');
    retriedReq.flush([{ id: 'group-1' }]);

    expect(finalResult).toEqual([{ id: 'group-1' }]);
  });

  it('logs out and redirects to /login when the refresh itself fails', () => {
    authServiceMock.refreshAccessToken.mockReturnValue(throwError(() => new Error('refresh failed')));

    let sawError = false;
    http.get(`${environment.apiBaseUrl}/groups/my-teaching/`).subscribe({
      error: () => (sawError = true),
    });

    const firstReq = httpMock.expectOne(`${environment.apiBaseUrl}/groups/my-teaching/`);
    firstReq.flush({ detail: 'Token expired' }, { status: 401, statusText: 'Unauthorized' });

    expect(sawError).toBe(true);
    expect(authServiceMock.clearTokens).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('does not attempt a refresh when there is no refresh token available', () => {
    authServiceMock.getRefreshToken = vi.fn(() => null);

    let sawError = false;
    http.get(`${environment.apiBaseUrl}/groups/my-teaching/`).subscribe({
      error: () => (sawError = true),
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/groups/my-teaching/`);
    req.flush({ detail: 'Token expired' }, { status: 401, statusText: 'Unauthorized' });

    expect(sawError).toBe(true);
    expect(authServiceMock.refreshAccessToken).not.toHaveBeenCalled();
  });
});
