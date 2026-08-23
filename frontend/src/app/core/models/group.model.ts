export interface Group {
  id: string;
  name: string;
  description: string;
  created_at: string;
  videos_count?: number;
  members_count?: number;
  // מוחזר רק כשה-endpoint /groups/{id}/ נצפה ע"י המשתמש הרלוונטי — עוזר ל-UI, לא לאבטחה (זו תמיד בשרת).
  is_owner?: boolean;
}

export interface GroupMember {
  id: number;
  username: string;
  joined_at: string;
}

export interface CreateGroupPayload {
  name: string;
  description: string;
  password: string;
}

export interface UpdateGroupPayload {
  name?: string;
  description?: string;
}

export interface JoinGroupPayload {
  password: string;
}

export interface ChangeGroupPasswordPayload {
  new_password: string;
}
