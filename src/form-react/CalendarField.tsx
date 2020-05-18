import { EventInput } from '@fullcalendar/core';
import moment from 'moment-timezone';
import * as React from 'react';
import { FieldArray, WrappedFieldArrayProps } from 'redux-form';

import { CalendarComponent as Cal } from '@waldur/booking/components/calendar/CalendarComponent';
import { BookingProps } from '@waldur/booking/types';
import {
  deleteCalendarBookingEvent,
  createAvailabilitySlots,
} from '@waldur/booking/utils';

type CalendarComponentProps = WrappedFieldArrayProps<any> & {
  excludedEvents?: BookingProps[];
  setModalProps: (event) => void;
  openModal: (cb) => void;
  schedules: EventInput[];
};

function isStartInArr(array, value) {
  return !!array.find(item => moment(item.start).isSame(moment(value)));
}
export class CalendarComponent extends React.Component<CalendarComponentProps> {
  getValidRange = events => ({
    start: Math.min(...events.map(event => moment(event.start).valueOf())),
    end: Math.max(...events.map(event => moment(event.end).valueOf())),
  });

  getCalendarConfig = () => {
    const eventWithConfig = this.props.excludedEvents.find(
      ({ extendedProps }) =>
        extendedProps.type === 'Availability' && extendedProps.config,
    );
    const {
      extendedProps: { config },
    } = eventWithConfig;
    return {
      ...config,
      defaultTimedEventDuration: config.slotDuration,
      minTime: config.businessHours.startTime,
      maxTime: config.businessHours.endTime,
    };
  };

  getAvailabilitySlots = events => {
    const { slotDuration } = this.getCalendarConfig();
    const slots = createAvailabilitySlots(
      this.props.excludedEvents,
      moment.duration(slotDuration),
    );
    return slots.filter(slot => !isStartInArr(events, slot.start));
  };

  render() {
    const { excludedEvents, fields } = this.props;
    const events = fields.getAll();
    if (!events) {
      return null;
    }

    return (
      <div>
        <Cal
          events={[...excludedEvents, ...events]}
          options={this.getCalendarConfig()}
          availabiltyEvents={this.getAvailabilitySlots(events)}
          calendarType="edit"
          addEventCb={fields.push}
          removeEventCb={oldID =>
            deleteCalendarBookingEvent(fields, { id: oldID })
          }
        />
      </div>
    );
  }
}

export const CalendarField = props => (
  <FieldArray name={props.name} component={CalendarComponent} {...props} />
);
