export interface Attachment {
  created: string;
  file: string;
  issue: string;
  issue_key: string;
  url: string;
  uuid: string;
}

export interface Action<T> {
  type: string;
  payload?: T;
}

export interface State {
  loading: boolean;
  errors: any[];
  items: Attachment[];
  uploading: number;
  deleting: { [key: string]: boolean };
  filter: string;
}

export interface Payload {
  loading?: boolean;
  error?: Response;
  items?: Attachment[];
  item?: Attachment;
  file?: File;
  uuid?: string;
  filter?: string;
  uploading?: number;
}
