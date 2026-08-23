import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, convertToParamMap, provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { groupOwnerGuard } from './group-owner.guard';

function routeWithId(id: string) {
  return { paramMap: convertToParamMap({ id }) } as any;
}

describe('groupOwnerGuard', () => {
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('allows navigation when the server confirms the user is the owner', async () => {
    const resultPromise = TestBed.runInInjectionContext(() =>
      groupOwnerGuard(routeWithId('g1'), {} as any),
    );

    httpMock
      .expectOne(`${environment.apiUrl}/groups/g1/`)
      .flush({ id: 'g1', name: 'x', description: '', created_at: 'now', is_owner: true });

    expect(await resultPromise).toBe(true);
  });

  it('redirects to the read-only view when the user is not the owner', async () => {
    const resultPromise = TestBed.runInInjectionContext(() =>
      groupOwnerGuard(routeWithId('g1'), {} as any),
    );

    httpMock
      .expectOne(`${environment.apiUrl}/groups/g1/`)
      .flush({ id: 'g1', name: 'x', description: '', created_at: 'now', is_owner: false });

    const result = await resultPromise;
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/groups/g1/view');
  });

  it('redirects to the read-only view when the server denies access (403)', async () => {
    const resultPromise = TestBed.runInInjectionContext(() =>
      groupOwnerGuard(routeWithId('g1'), {} as any),
    );

    httpMock
      .expectOne(`${environment.apiUrl}/groups/g1/`)
      .flush({ detail: 'forbidden' }, { status: 403, statusText: 'Forbidden' });

    const result = await resultPromise;
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/groups/g1/view');
  });
});
