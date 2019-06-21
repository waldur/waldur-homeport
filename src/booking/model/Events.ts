import { DateInput } from '@fullcalendar/core/datelib/env';
import { EventInput } from '@fullcalendar/core/structs/event';

import { randomId } from '@waldur/core/fixtures';

export class BookingEvent implements EventInput {
  id: string;
  type: string;
  start: DateInput;
  end: DateInput;
  allDay: boolean;
  title: string;
  constructor(slot: EventInput) {
    const { start, end, allDay, title } = slot;
    this.id = randomId();
    this.type = 'availability';
    this.start = start;
    this.end = end;
    this.allDay = allDay;
    this.title = title;
  }
}
