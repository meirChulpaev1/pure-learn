import { User } from './user.model';

/** GET /api/groups/my-teaching/ , /api/groups/my-student/ */
export interface GroupSummary {
  id: string;
  name: string;
  description: string;
  videos_count: number;
  members_count: number;
  created_at: string;
}

/** GET /api/groups/{id}/ , POST /api/groups/join/ */
export interface GroupDetail {
  id: string;
  name: string;
  description: string;
  owner_username: string;
  is_owner: boolean;
  videos_count: number;
  members_count: number;
  created_at: string;
}

export interface CreateGroupPayload {
  name: string;
  description: string;
  password: string;
}

/** תגובת POST /api/groups/  — GroupCreateSerializer */
export interface CreateGroupResponse {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface UpdateGroupPayload {
  name?: string;
  description?: string;
}

export interface ChangeGroupPasswordPayload {
  new_password: string;
}

/** GET /api/groups/{id}/members/  — GroupMemberSerializer */
export interface GroupMember {
  id: number;
  user: User;
  joined_at: string;
}
