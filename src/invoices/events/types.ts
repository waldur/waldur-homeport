import { Event } from '@waldur/events/types';

export interface InvoiceEvent {
  date: string;
  message: string;
  color: string;
  icon: string;
  original: Event;
}
