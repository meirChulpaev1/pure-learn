import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('starts logged out when there is no stored token', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.accessToken()).toBeNull();
  });

  it('login() stores tokens and then loads the current user', () => {
    let result: unknown;
    service.login({ username: 'meir', password: 'StrongPass123!' }).subscribe((user) => (result = user));

    const loginReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login/`);
    expect(loginReq.request.method).toBe('POST');
    loginReq.flush({ access: 'access-token', refresh: 'refresh-token' });

    expect(service.isLoggedIn()).toBe(true);
    expect(service.accessToken()).toBe('access-token');
    expect(localStorage.getItem('sg_access_token')).toBe('access-token');

    const meReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/me/`);
    expect(meReq.request.method).toBe('GET');
    meReq.flush({ id: 1, username: 'meir', email: 'meir@example.com', date_joined: '2026-01-01' });

    expect(service.currentUser()?.username).toBe('meir');
    expect(result).toEqual(expect.objectContaining({ username: 'meir' }));
  });

  it('register() posts to /auth/register/ without touching tokens', () => {
    service.register({ username: 'dana', email: 'dana@example.com', password: 'StrongPass123!' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/register/`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 2, username: 'dana', email: 'dana@example.com' });

    expect(service.isLoggedIn()).toBe(false);
  });

  it('logout() clears local tokens even if the server call is in flight', () => {
    service.setTokens({ access: 'a', refresh: 'r' });
    expect(service.isLoggedIn()).toBe(true);

    service.logout();

    // הניקוי המקומי קורה מיד ("best effort" מול השרת)
    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('sg_access_token')).toBeNull();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/logout/`);
    req.flush({}, { status: 205, statusText: 'Reset Content' });
  });

  it('refreshAccessToken() updates the stored access token', () => {
    service.setTokens({ access: 'old-access', refresh: 'refresh-token' });

    let newAccess: string | undefined;
    service.refreshAccessToken().subscribe((res) => (newAccess = res.access));

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/refresh/`);
    expect(req.request.body).toEqual({ refresh: 'refresh-token' });
    req.flush({ access: 'new-access' });

    expect(newAccess).toBe('new-access');
    expect(service.accessToken()).toBe('new-access');
  });
});
