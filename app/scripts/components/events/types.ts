export interface EventGroup {
  icon: string;
  name: string;
  descriptions: string[];
}

export interface IconType {
  imageId: string;
  text: string;
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
