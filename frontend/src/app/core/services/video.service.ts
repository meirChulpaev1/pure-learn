import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateVideoPayload, UpdateVideoPayload, Video } from '../models/video.model';

@Injectable({ providedIn: 'root' })
export class VideoService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  private videosUrl(groupId: string): string {
    return `${this.base}/groups/${groupId}/videos/`;
  }

  list(groupId: string): Observable<Video[]> {
    return this.http.get<Video[]>(this.videosUrl(groupId));
  }

  get(groupId: string, videoId: number): Observable<Video> {
    return this.http.get<Video>(`${this.videosUrl(groupId)}${videoId}/`);
  }

  create(groupId: string, payload: CreateVideoPayload): Observable<Video> {
    return this.http.post<Video>(this.videosUrl(groupId), payload);
  }

  update(groupId: string, videoId: number, payload: UpdateVideoPayload): Observable<Video> {
    return this.http.patch<Video>(`${this.videosUrl(groupId)}${videoId}/`, payload);
  }

  remove(groupId: string, videoId: number): Observable<void> {
    return this.http.delete<void>(`${this.videosUrl(groupId)}${videoId}/`);
  }
}
