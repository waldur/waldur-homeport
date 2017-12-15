export interface EventGroup {
  icon: string;
  name: string;
  descriptions: string[];
}

export interface IconType {
  imageId: string;
  text: string;
};

export interface Event {
  user_uuid: string;
  user_full_name: string;
  user_username: string;
  importance: string;
  timestamp: Date;
  ip_address: string;
  event_type: string;
  error_message: string;
  project_uuid: string;
  project_name: string;
  link: string;
  issue_link: string;
  customer_uuid: string;
  customer_name: string;
  service_uuid: string;
  service_name: string;
  service_type: string;
  resource_uuid: string;
  resource_full_name: string;
  resource_configuration: string;
  resource_type: string;
  message: string;
}
