export const TABLE_ID_DASHBOARD_ALERTS = 'dashboard/alerts';
export const TABLE_ID_DASHBOARD_EVENTS = 'dashboard/events';

export interface FeedItem {
  html_message: string;
  created: Date;
  event_type?: string;
};

export interface Project {
  uuid: string;
  url: string;
};
