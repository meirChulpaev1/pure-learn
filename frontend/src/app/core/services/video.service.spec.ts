import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { VideoService } from './video.service';

describe('VideoService', () => {
  let service: VideoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(VideoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('scopes list() under the given group id', () => {
    service.list('g1').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/groups/g1/videos/`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('creates a video under the group', () => {
    const payload = { title: 'Intro', description: '', url: 'https://youtu.be/abc' };
    service.create('g1', payload).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/groups/g1/videos/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1, ...payload, created_at: 'now', uploader_username: 'meir', group: 'g1' });
  });

  it('deletes a specific video by id', () => {
    service.remove('g1', 7).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/groups/g1/videos/7/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
