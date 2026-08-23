import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('attaches the Bearer token to authenticated requests', () => {
    sessionStorage.setItem('sg_access_token', 'token-abc');
    TestBed.inject(AuthService);

    http.get(`${environment.apiUrl}/groups/my-teaching/`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/groups/my-teaching/`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-abc');
    req.flush([]);
  });

  it('does not attach a header to the public login request', () => {
    http.post(`${environment.apiUrl}/auth/login/`, { username: 'a', password: 'b' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login/`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ access: 'x', refresh: 'y' });
    httpMock.expectOne(`${environment.apiUrl}/auth/me/`).flush({ id: 1, username: 'a', email: 'a@a.com' });
  });

  it('refreshes the access token once on a 401 and retries the original request', () => {
    sessionStorage.setItem('sg_access_token', 'expired-token');
    sessionStorage.setItem('sg_refresh_token', 'refresh-token');
    TestBed.inject(AuthService);

    let result: unknown;
    http.get(`${environment.apiUrl}/groups/my-teaching/`).subscribe((res) => (result = res));

    const firstReq = httpMock.expectOne(`${environment.apiUrl}/groups/my-teaching/`);
    expect(firstReq.request.headers.get('Authorization')).toBe('Bearer expired-token');
    firstReq.flush({ detail: 'expired' }, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne(`${environment.apiUrl}/auth/refresh/`);
    refreshReq.flush({ access: 'fresh-token' });

    const retriedReq = httpMock.expectOne(`${environment.apiUrl}/groups/my-teaching/`);
    expect(retriedReq.request.headers.get('Authorization')).toBe('Bearer fresh-token');
    retriedReq.flush([{ id: 'g1' }]);

    expect(result).toEqual([{ id: 'g1' }]);
  });
});
