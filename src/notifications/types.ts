interface Template {
  path: string;
  name: string;
}

interface NotificationTemplate extends Template {
  uuid?: string;
}

export type NotificationTemplateRequestData = NotificationTemplate;

export interface NotificationMessageTemplate {
  uuid: string;
  url: string;
  path: string;
  name: string;
  content: string;
}
