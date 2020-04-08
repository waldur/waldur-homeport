import { EventInput } from '@fullcalendar/core';
import * as React from 'react';
import { FieldArray, WrappedFieldArrayProps } from 'redux-form';

import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { CalendarEventModal } from '@waldur/booking/components/modal/CalendarEventModal';
import {
  eventsMapper,
  createCalendarBookingEvent,
  deleteCalendarBookingEvent,
} from '@waldur/booking/utils';
import { Event } from '@waldur/events/types';
import { withModal } from '@waldur/modal/withModal';

type CalendarComponentProps = WrappedFieldArrayProps<any> & {
  excludedEvents?: Event[];
  setModalProps: (event) => void;
  openModal: (cb) => void;
  schedules: EventInput[];
};

export class CalendarComponent extends React.Component<CalendarComponentProps> {
  state = {
    view: {
      type: undefined,
    },
  };

  deleteBooking = e => deleteCalendarBookingEvent(this.props.fields, e);

  handleBooking = event => {
    this.props.setModalProps({
      event,
      destroy: () => this.deleteBooking(event),
    });
    this.props.openModal(onSuccess => {
      this.props.fields.push(
        createCalendarBookingEvent({ ...event.extendedProps, ...onSuccess }),
      );
      this.deleteBooking(event);
    });
  };

  getValidRange = events => ({
    start: Math.min(...events.map(event => Date.parse(event.start))),
    end: Math.max(...events.map(event => Date.parse(event.end))),
  });

  render() {
    const { excludedEvents, fields } = this.props;
    let events = fields.getAll();
    if (!events) {
      return null;
    }
    events = eventsMapper([...excludedEvents, ...events]);
    return (
      <Calendar
        editable={true}
        defaultView={this.state.view.type}
        selectable={true}
        eventResizableFromStart={false}
        events={events}
        eventLimit={false}
        validRange={this.getValidRange(events)}
        viewSkeletonRender={({ view }) => {
          if (view.type !== this.state.view.type) {
            this.setState({ view });
          }
        }}
        select={event =>
          fields.push(
            createCalendarBookingEvent({ ...event, type: 'ScheduleBooking' }),
          )
        }
        eventClick={e => this.handleBooking(e.event)}
      />
    );
  }
}

export const CalendarField = props => (
  <FieldArray
    name={props.name}
    component={withModal(CalendarEventModal)(CalendarComponent)}
    {...props}
  />
);
