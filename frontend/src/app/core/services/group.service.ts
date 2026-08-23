import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChangeGroupPasswordPayload,
  CreateGroupPayload,
  Group,
  GroupMember,
  JoinGroupPayload,
  UpdateGroupPayload,
} from '../models/group.model';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/groups`;

  // httpResource: signal-based (value()/isLoading()/error()), נטען אוטומטית ומתעדכן מחדש עם reload().
  // ה-authInterceptor הגלובלי מוסיף Authorization גם לקריאות דרך httpResource, כי היא עדיין עוברת ב-HttpClient.
  readonly myTeachingGroups = httpResource<Group[]>(() => `${this.baseUrl}/my-teaching/`, {
    defaultValue: [],
  });

  readonly myStudentGroups = httpResource<Group[]>(() => `${this.baseUrl}/my-student/`, {
    defaultValue: [],
  });

  createGroup(payload: CreateGroupPayload): Observable<Group> {
    return this.http.post<Group>(`${this.baseUrl}/`, payload);
  }

  getGroup(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.baseUrl}/${id}/`);
  }

  updateGroup(id: string, payload: UpdateGroupPayload): Observable<Group> {
    return this.http.patch<Group>(`${this.baseUrl}/${id}/`, payload);
  }

  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }

  changePassword(id: string, payload: ChangeGroupPasswordPayload): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/change-password/`, payload);
  }

  joinGroup(payload: JoinGroupPayload): Observable<Group> {
    return this.http.post<Group>(`${this.baseUrl}/join/`, payload);
  }

  getMembers(id: string): Observable<GroupMember[]> {
    return this.http.get<GroupMember[]>(`${this.baseUrl}/${id}/members/`);
  }

  removeMember(id: string, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/members/${userId}/`);
  }

  /**
   * שימוש ב-HttpClient (לא fetch() גולמי) — כדי שה-authInterceptor יצרף את ה-Bearer token.
   * ה-Guard משתמש בזה רק לנוחות ניווט; האכיפה האמיתית תמיד בשרת (403 אם לא Owner).
   */
  async checkIsOwner(groupId: string): Promise<boolean> {
    try {
      const group = await firstValueFrom(this.getGroup(groupId));
      return group.is_owner === true;
    } catch {
      return false;
    }
  }
}
