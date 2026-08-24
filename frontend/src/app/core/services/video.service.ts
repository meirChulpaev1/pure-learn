import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, Signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateVideoPayload, UpdateVideoPayload, Video } from '../models/video.model';

@Injectable({ providedIn: 'root' })
export class VideoService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  /** מקור ריאקטיבי: רשימת הסרטונים של קבוצה, נטען מחדש אוטומטית כש-groupId משתנה. */
  videosResource(groupId: Signal<string | undefined>) {
    return httpResource<Video[]>(
      () => {
        const id = groupId();
        return id ? `${this.baseUrl}/groups/${id}/videos/` : undefined;
      },
      { defaultValue: [] },
    );
  }

  addVideo(groupId: string, payload: CreateVideoPayload): Observable<Video> {
    return this.http.post<Video>(`${this.baseUrl}/groups/${groupId}/videos/`, payload);
  }

  updateVideo(groupId: string, videoId: number, payload: UpdateVideoPayload): Observable<Video> {
    return this.http.patch<Video>(`${this.baseUrl}/groups/${groupId}/videos/${videoId}/`, payload);
  }

  deleteVideo(groupId: string, videoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/groups/${groupId}/videos/${videoId}/`);
  }
}
