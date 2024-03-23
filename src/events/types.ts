type ContextMapper = (event: any) => { [key: string]: string | JSX.Element };

interface EventType {
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
  uuid: string;
  event_type: string;
  message: string;
  created: string;
  context: Record<string, any>;
}

export interface EventStat {
  year: number;
  month: number;
  count: number;
}
