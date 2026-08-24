import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceMock: { isLoggedIn: () => boolean };
  let router: Router;

  function runGuard(url = '/dashboard') {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url } as never),
    );
  }

  beforeEach(() => {
    authServiceMock = { isLoggedIn: vi.fn(() => false) };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    });
    router = TestBed.inject(Router);
  });

  it('allows navigation when the user is logged in', () => {
    authServiceMock.isLoggedIn = () => true;
    const result = runGuard();
    expect(result).toBe(true);
  });

  it('redirects to /login with a returnUrl when the user is logged out', () => {
    authServiceMock.isLoggedIn = () => false;
    const result = runGuard('/groups/123/manage') as UrlTree;

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result)).toBe('/login?returnUrl=%2Fgroups%2F123%2Fmanage');
  });
});
