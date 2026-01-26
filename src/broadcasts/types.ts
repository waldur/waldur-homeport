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

interface Broadcast extends Message {
  send_at: string;
}

export interface BroadcastFormData extends Broadcast {
  customers: IdNamePair[];
  offerings: IdNamePair[];
  all_users: boolean;
  action?: 'draft' | 'submit';
}

interface QueryRequest {
  customers: string[];
  offerings: string[];
  all_users: boolean;
}

export interface BroadcastRequestData extends Broadcast {
  query: QueryRequest;
}
