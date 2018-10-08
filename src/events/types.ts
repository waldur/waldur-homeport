type ContextMapper = (event: any) => {[key: string]: string};

export interface EventType {
  key: string;
  title: string;
  formatter?: (event: any) => string;
}

export interface EventGroup {
  title: string;
  events: EventType[];
  context?: ContextMapper;
}

export interface Event {
  event_type: string;
  importance: string;
  user_uuid: string;
  user_username: string;
  user_full_name: string;
  ip_address: string;
  message: string;
  ['@timestamp']: string;
  [key: string]: string;
}
