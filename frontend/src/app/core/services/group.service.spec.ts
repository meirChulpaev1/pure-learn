import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { GroupService } from './group.service';

describe('GroupService', () => {
  let service: GroupService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GroupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('posts to /groups/ when creating a group', () => {
    service
      .createGroup({ name: 'Python Beginners', description: 'intro', password: 'PY123' })
      .subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/groups/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.password).toBe('PY123');
    req.flush({ id: 'g1', name: 'Python Beginners', description: 'intro', created_at: 'now' });
  });

  it('posts the password only (no group id) when joining a group', () => {
    service.joinGroup({ password: 'PY123' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/groups/join/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ password: 'PY123' });
    req.flush({ id: 'g1', name: 'Python Beginners', description: '', created_at: 'now' });
  });

  it('checkIsOwner() resolves true when the server marks is_owner', async () => {
    const promise = service.checkIsOwner('g1');

    const req = httpMock.expectOne(`${environment.apiUrl}/groups/g1/`);
    req.flush({ id: 'g1', name: 'x', description: '', created_at: 'now', is_owner: true });

    await expect(promise).resolves.toBe(true);
  });

  it('checkIsOwner() resolves false when the request fails (e.g. 403)', async () => {
    const promise = service.checkIsOwner('g1');

    const req = httpMock.expectOne(`${environment.apiUrl}/groups/g1/`);
    req.flush({ detail: 'forbidden' }, { status: 403, statusText: 'Forbidden' });

    await expect(promise).resolves.toBe(false);
  });

  it('sends DELETE to remove a member by user id', () => {
    service.removeMember('g1', 42).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/groups/g1/members/42/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('patches the change-password endpoint', () => {
    service.changePassword('g1', { new_password: 'newpass' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/groups/g1/change-password/`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ new_password: 'newpass' });
    req.flush(null);
  });
});
