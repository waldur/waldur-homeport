import type { EventInput } from '@fullcalendar/core';
import { FunctionComponent } from 'react';

import { Calendar } from './Calendar';

interface EditableCalendarProps {
  events: EventInput[];
  onSelectDate: (event) => void;
  eventDrop: (event) => void;
  onSelectEvent: (event) => void;
  eventResize: (event) => void;
}

export const EditableCalendar: FunctionComponent<EditableCalendarProps> = (
  props,
) => (
  <Calendar
    editable={true}
    selectable={true}
    eventResizableFromStart={true}
    events={props.events}
    select={(event) => props.onSelectDate(event)}
    eventDrop={(event) => props.eventDrop(event)}
    eventClick={(event) => props.onSelectEvent(event)}
    eventResize={(event) => props.eventResize(event)}
  />
);
