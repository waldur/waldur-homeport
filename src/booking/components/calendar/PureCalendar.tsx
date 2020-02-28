import * as React from 'react';

import * as format from '@waldur/booking/components/calendar/EventFormaters';
import {calendarEventPayloadCreator} from '@waldur/booking/utils';
import {randomId} from '@waldur/core/fixtures';

import { EditableCalendarProps } from '../../store/types';
import { Calendar } from './Calendar';

export const PureCalendar = (props: EditableCalendarProps) => {

  const readOnlyEvents = {
    events: props.calendar.bookings,
    editable: false,
    eventDataTransform(eventData) {
      if (props.calendarType === 'create') {
        format.scheduleEvent(eventData);
        format.availabilityEvent(eventData);
      } else {
        format.configurationEvent(eventData);
        format.statedEvent(eventData);
        return eventData;
      }
    },
  };

  const editableEvents = {
    events: props.calendar.schedules,
    editable: true,
    selectable: true,
    slotEventOverlap: true,
  };

  const formEvents = props.formEvents ? {
    events: props.formEvents,
    editable: true,
    color: 'pink',
  } : [];

  return (
    <Calendar
      {...props.calendar.config}
      editable={true}
      selectable={true}
      eventLimit={false}
      eventResizableFromStart={true}
      eventSources={[ readOnlyEvents, editableEvents, formEvents ]}

      select={selectInfo => {
        const event = {
          start: selectInfo.start,
          end: selectInfo.end,
          allDay: selectInfo.allDay,
          id: `${randomId()}-${selectInfo.jsEvent.timeStamp}`,
          type: props.calendarType === 'create' ? 'availability' : 'scheduleBooking',
        };
        props.onSelectDate(event);
      }}
      eventClick={clickInfo => props.onEventClick(calendarEventPayloadCreator(clickInfo, props.calendar.schedules))}
      eventDrop={dropInfo => props.updateCallback(calendarEventPayloadCreator(dropInfo, props.calendar.schedules))}
      eventResize={resizeInfo => props.updateCallback(calendarEventPayloadCreator(resizeInfo, props.calendar.schedules))}

    />
  );
};
