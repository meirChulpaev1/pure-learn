import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('starts logged out when there is no stored token', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.accessToken()).toBeNull();
  });

  it('stores tokens and flips isLoggedIn() to true after a successful login', () => {
    service.login({ username: 'meir', password: 'secret123' }).subscribe();

    const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login/`);
    expect(loginReq.request.method).toBe('POST');
    loginReq.flush({ access: 'access-token', refresh: 'refresh-token' });

    // ה-login גם מפעיל loadCurrentUser() ברקע.
    const meReq = httpMock.expectOne(`${environment.apiUrl}/auth/me/`);
    meReq.flush({ id: 1, username: 'meir', email: 'meir@example.com' });

    expect(service.isLoggedIn()).toBe(true);
    expect(service.accessToken()).toBe('access-token');
    expect(sessionStorage.getItem('sg_access_token')).toBe('access-token');
  });

  it('clears all session state on logout', () => {
    service.login({ username: 'meir', password: 'secret123' }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login/`).flush({
      access: 'access-token',
      refresh: 'refresh-token',
    });
    httpMock.expectOne(`${environment.apiUrl}/auth/me/`).flush({
      id: 1,
      username: 'meir',
      email: 'meir@example.com',
    });

    service.logout();
    httpMock.expectOne(`${environment.apiUrl}/auth/logout/`).flush(null);

    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(sessionStorage.getItem('sg_access_token')).toBeNull();
    expect(sessionStorage.getItem('sg_refresh_token')).toBeNull();
  });

  it('sends a registration request without touching the session state', () => {
    service.register({ username: 'dana', email: 'dana@example.com', password: 'strongpass1' })
      .subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register/`);
    expect(req.request.body).toEqual({
      username: 'dana',
      email: 'dana@example.com',
      password: 'strongpass1',
    });
    req.flush({ id: 2, username: 'dana', email: 'dana@example.com' });

    expect(service.isLoggedIn()).toBe(false);
  });
});
