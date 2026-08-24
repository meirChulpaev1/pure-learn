import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, Signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChangeGroupPasswordPayload,
  CreateGroupPayload,
  CreateGroupResponse,
  GroupDetail,
  GroupMember,
  GroupSummary,
  UpdateGroupPayload,
} from '../models/group.model';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  // --- Dashboard: reactive signal-based resources (Angular 21 httpResource) ---

  /** GET /api/groups/my-teaching/ — signal-based, כולל value()/isLoading()/error() אוטומטית. */
  myTeachingGroups() {
    return httpResource<GroupSummary[]>(() => `${this.baseUrl}/groups/my-teaching/`, {
      defaultValue: [],
    });
  }

  /** GET /api/groups/my-student/ */
  myStudentGroups() {
    return httpResource<GroupSummary[]>(() => `${this.baseUrl}/groups/my-student/`, {
      defaultValue: [],
    });
  }

  /** מקור ריאקטיבי לפרטי קבוצה בודדת, תלוי ב-signal של group id (יכול להשתנות עם ניווט). */
  groupDetailResource(groupId: Signal<string | undefined>) {
    return httpResource<GroupDetail | undefined>(() => {
      const id = groupId();
      return id ? `${this.baseUrl}/groups/${id}/` : undefined;
    });
  }

  membersResource(groupId: Signal<string | undefined>) {
    return httpResource<GroupMember[]>(
      () => {
        const id = groupId();
        return id ? `${this.baseUrl}/groups/${id}/members/` : undefined;
      },
      { defaultValue: [] },
    );
  }

  // --- Mutations (Observable-based actions) -----------------------------

  getGroupDetail(groupId: string): Observable<GroupDetail> {
    return this.http.get<GroupDetail>(`${this.baseUrl}/groups/${groupId}/`);
  }

  createGroup(payload: CreateGroupPayload): Observable<CreateGroupResponse> {
    return this.http.post<CreateGroupResponse>(`${this.baseUrl}/groups/`, payload);
  }

  updateGroup(groupId: string, payload: UpdateGroupPayload): Observable<UpdateGroupPayload> {
    return this.http.patch<UpdateGroupPayload>(`${this.baseUrl}/groups/${groupId}/`, payload);
  }

  deleteGroup(groupId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/groups/${groupId}/`);
  }

  changeGroupPassword(groupId: string, payload: ChangeGroupPasswordPayload): Observable<{ detail: string }> {
    return this.http.patch<{ detail: string }>(`${this.baseUrl}/groups/${groupId}/change-password/`, payload);
  }

  joinGroup(password: string): Observable<GroupDetail> {
    return this.http.post<GroupDetail>(`${this.baseUrl}/groups/join/`, { password });
  }

  removeMember(groupId: string, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/groups/${groupId}/members/${userId}/`);
  }
}
