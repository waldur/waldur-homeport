interface Message {
  subject: string;
  body: string;
}

export interface MessageTemplate extends Message {
  uuid: string;
}

export interface IdNamePair {
  name: string;
  uuid: string;
}

interface Notification extends Message {
  send_at: string;
}
export interface NotificationFormData extends Notification {
  customers: IdNamePair[];
  offerings: IdNamePair[];
  all_users: boolean;
}

interface QueryRequest {
  customers: string[];
  offerings: string[];
  all_users: boolean;
}

interface QueryResponse {
  customers: IdNamePair[];
  offerings: IdNamePair[];
  projects: IdNamePair[];
  customer_roles: string[];
  project_roles: string[];
  all_users: boolean;
}

export interface NotificationRequestData extends Notification {
  query: QueryRequest;
}

export interface NotificationResponseData extends Notification {
  uuid: string;
  query: QueryResponse;
  emails: string[];
  created: string;
  state: string;
  author_full_name: string;
}

export interface NotificationMessageTemplate {
  uuid: string;
  url: string;
  path: string;
  name: string;
  content: string;
}
