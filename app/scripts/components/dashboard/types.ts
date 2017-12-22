export interface FeedItem {
  html_message: string;
  created: Date;
  event_type?: string;
}

export interface Project {
  uuid: string;
  url: string;
}
