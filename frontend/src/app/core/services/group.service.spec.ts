import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GroupService } from './group.service';
import { environment } from '../../../environments/environment';

describe('GroupService', () => {
  let service: GroupService;
  let httpMock: HttpTestingController;
  const base = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GroupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('createGroup() POSTs to /groups/ with name, description and password', () => {
    service.createGroup({ name: 'Python Beginners', description: 'desc', password: 'PY123' }).subscribe();
    const req = httpMock.expectOne(`${base}/groups/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Python Beginners', description: 'desc', password: 'PY123' });
    req.flush({ id: 'group-1', name: 'Python Beginners', description: 'desc', created_at: '2026-01-01' });
  });

  it('joinGroup() POSTs only the password to /groups/join/', () => {
    service.joinGroup('PY123').subscribe();
    const req = httpMock.expectOne(`${base}/groups/join/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ password: 'PY123' });
    req.flush({ id: 'group-1' });
  });

  it('updateGroup() sends a PATCH with only the changed fields', () => {
    service.updateGroup('group-1', { name: 'New Name' }).subscribe();
    const req = httpMock.expectOne(`${base}/groups/group-1/`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ name: 'New Name' });
    req.flush({ name: 'New Name' });
  });

  it('deleteGroup() sends a DELETE to the group detail endpoint', () => {
    service.deleteGroup('group-1').subscribe();
    const req = httpMock.expectOne(`${base}/groups/group-1/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('changeGroupPassword() PATCHes the change-password endpoint', () => {
    service.changeGroupPassword('group-1', { new_password: 'NEW123' }).subscribe();
    const req = httpMock.expectOne(`${base}/groups/group-1/change-password/`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ new_password: 'NEW123' });
    req.flush({ detail: 'סיסמת הקבוצה עודכנה בהצלחה.' });
  });

  it('removeMember() sends a DELETE to /groups/{id}/members/{userId}/', () => {
    service.removeMember('group-1', 42).subscribe();
    const req = httpMock.expectOne(`${base}/groups/group-1/members/42/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('getGroupDetail() sends a GET to /groups/{id}/', () => {
    service.getGroupDetail('group-1').subscribe();
    const req = httpMock.expectOne(`${base}/groups/group-1/`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'group-1', is_owner: true });
  });
});
