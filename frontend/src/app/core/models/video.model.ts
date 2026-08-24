export interface Video {
  id: number;
  title: string;
  description: string;
  url: string;
  created_at: string;
  uploader_username: string;
  group: string;
}

export interface CreateVideoPayload {
  title: string;
  description: string;
  url: string;
}

export interface UpdateVideoPayload {
  title?: string;
  description?: string;
  url?: string;
}
