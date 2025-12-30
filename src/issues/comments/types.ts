export interface Comment {
  author_name: string;
  author_user: string;
  author_uuid: string;
  author_email: string;
  backend_id: string;
  created: string;
  description: string;
  is_public?: boolean;
  issue: string;
  issue_key: string;
  url: string;
  uuid: string;
  update_is_available: boolean;
  destroy_is_available: boolean;
}
