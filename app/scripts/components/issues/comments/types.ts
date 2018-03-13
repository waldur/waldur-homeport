import { Attachment } from '@waldur/issues/attachments/types';

export interface Issue {
  [key: string]: string | boolean;
}

export interface Comment {
  author_name: string;
  author_user: string;
  author_uuid: string;
  author_email: string;
  backend_id: string;
  created: string;
  description: string;
  is_public: boolean;
  issue: string;
  issue_key: string;
  url: string;
  uuid: string;
}

export interface State {
  loading: boolean;
  errors: any[];
  items: Comment[];
  deleting: { [key: string]: boolean };
  activeFormId: string;
  pendingAttachments: Attachment[];
  issue: Issue;
  uiDisabled: boolean;
  getErred: boolean;
}

export interface Payload {
  items?: Comment[];
  item?: Comment;
  loading?: boolean;
  error?: Response;
  formId?: string;
  commentId?: string;
  issue?: Issue;
  uiDisabled?: boolean;
  uuid: string;
  resolve(): void;
  reject(): void;
}

export interface User {
  [key: string]: string | boolean;
}
