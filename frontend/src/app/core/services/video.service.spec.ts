import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { VideoService } from './video.service';
import { environment } from '../../../environments/environment';

describe('VideoService', () => {
  let service: VideoService;
  let httpMock: HttpTestingController;
  const base = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(VideoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('addVideo() POSTs to /groups/{groupId}/videos/', () => {
    service.addVideo('group-1', { title: 'Python Variables', description: '', url: 'https://youtube.com/watch?v=abc' }).subscribe();
    const req = httpMock.expectOne(`${base}/groups/group-1/videos/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Python Variables', description: '', url: 'https://youtube.com/watch?v=abc' });
    req.flush({ id: 1, title: 'Python Variables' });
  });

  it('updateVideo() PATCHes /groups/{groupId}/videos/{id}/', () => {
    service.updateVideo('group-1', 7, { title: 'Updated title' }).subscribe();
    const req = httpMock.expectOne(`${base}/groups/group-1/videos/7/`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ title: 'Updated title' });
    req.flush({ id: 7, title: 'Updated title' });
  });

  it('deleteVideo() sends a DELETE to /groups/{groupId}/videos/{id}/', () => {
    service.deleteVideo('group-1', 7).subscribe();
    const req = httpMock.expectOne(`${base}/groups/group-1/videos/7/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
