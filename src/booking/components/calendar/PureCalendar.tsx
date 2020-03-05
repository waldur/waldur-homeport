import {EventSourceInput} from '@fullcalendar/core/structs/event-source';
import * as React from 'react';

import {calendarEventPayloadCreator} from '@waldur/booking/utils';
import {randomId} from '@waldur/core/fixtures';

import { EditableCalendarProps } from '../../store/types';
import { Calendar } from './Calendar';

const formEvents = [
  {
    title: 'Business Lunch',
    start: '2020-04-03T13:00:00',
    constraint: 'businessHours',
  },
  {
    title: 'Meeting',
    start: '2020-04-13T11:00:00',
    constraint: 'availableForMeeting', // defined below
    color: '#257e4a',
  },
  {
    title: 'Conference',
    start: '2020-04-18',
    end: '2020-04-20',
  },
  {
    title: 'Party',
    start: '2020-04-29T20:00:00',
  },

  // areas where "Meeting" must be dropped
  {
    groupId: 'availableForMeeting',
    start: '2020-04-11T10:00:00',
    end: '2020-04-11T16:00:00',
    rendering: 'background',
  },
  {
    groupId: 'availableForMeeting',
    start: '2020-04-13T10:00:00',
    end: '2020-04-13T16:00:00',
    rendering: 'background',
  },

  // red areas where no events can be dropped
  {
    start: '2020-04-24',
    end: '2020-04-28',
    overlap: false,
    rendering: 'background',
    color: '#ff9f89',
  },
  {
    start: '2020-04-06',
    end: '2020-04-08',
    overlap: false,
    rendering: 'background',
    color: '#ff9f89',
  },
];

export const PureCalendar = (props: EditableCalendarProps) => {
  const calendarSources = [
    {
      name: 'readOnlyEvents',
      events: props.calendar.bookings,
      editable: false,
      selectable: false,
      overlap: true,
      success: console.log,
    },
    {
      name: 'editableEvents',
      events: props.calendar.schedules,
      editable: true,
      selectable: true,
      selectConstraint: 'availability-hours',
    },
    {
      name: 'formEvents',
      events: props.formEvents ? props.formEvents : [],
      editable: true,
      color: 'pink',
    },
  ] as EventSourceInput[];

  return (
    <Calendar
      {...props.calendar.config}
      editable={true}
      selectable={true}
      slotEventOverlap={true}
      selectConstraint={props.calendarType === 'create' ? null : 'availability-hours'}
      eventLimit={false}
      height="auto"
      businessHours={props.calendar.config.businessHours}
      eventResizableFromStart={true}
      eventSources={calendarSources}
      eventRender={({event, el}) => {
        if (event.title === '') {
          event.setProp('title', event.extendedProps.type);
        }
        const htmlTime = el.querySelector('fc-time');
        const htmlTitle = el.querySelector('fc-title');
        const content = el.querySelector('fc-content');
        // htmlTime.innerHTML = `<i class="fa fa-clock-o"></i> ${el.children[0].innerHTML}`;
        // htmlTitle.innerHTML = `<i class="fa fa-calendar"></i> ${el.children[0].innerHTML}`;
        el.children[0].innerHTML = `<i class="fa fa-calendar"></i> ${el.children[0].innerHTML}`;
      }}

      eventDataTransform={eventData => {
        if (props.calendarType === 'create') {
          if ((eventData.type || eventData.extendedProps.type) === 'availability') {
            eventData.overlap = false;
            // eventData.rendering = 'background';
            eventData.constraint = 'businessHours';
            eventData.title = eventData.title !== '' ? eventData.title : 'Availability';
          }
          return eventData;
        } else {
          if ((eventData.type || eventData.extendedProps.type) === 'availability') {
            eventData.overlap = true;
            eventData.groupId = 'businessHours';
            eventData.rendering = 'background';
            eventData.title = eventData.title !== '' ? eventData.title : 'Availability';
          } else {
            eventData.constraint = 'businessHours';
          }
        }
        return eventData;
      }}

      select={selectInfo => {
        const event = {
          start: props.calendarType === 'create' ? selectInfo.startStr : selectInfo.start,
          end: props.calendarType === 'create' ? selectInfo.endStr : selectInfo.end,
          allDay: selectInfo.allDay,
          id: props.calendarType === 'create' ? 'availability' : `${randomId()}-${selectInfo.jsEvent.timeStamp}`,
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
