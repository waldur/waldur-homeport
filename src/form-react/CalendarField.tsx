import { OptionsInput } from '@fullcalendar/core';
import moment from 'moment-timezone';
import * as React from 'react';
import { FieldArray } from 'redux-form';

import { CalendarComponent } from '@waldur/booking/components/calendar/CalendarComponent';
import { EditableCalendarProps } from '@waldur/booking/types';
import {
  deleteCalendarBookingEvent,
  createAvailabilitySlots,
} from '@waldur/booking/utils';

export class EditableCalendar extends React.Component<EditableCalendarProps> {
  getValidRange = events => ({
    start: Math.min(...events.map(event => moment(event.start).valueOf())),
    end: Math.max(...events.map(event => moment(event.end).valueOf())),
  });

  getCalendarConfig = () => {
    const eventWithConfig = this.props.excludedEvents.find(
      ({ extendedProps: { type, config } }) =>
        type === 'Availability' && config,
    );
    const validRange = this.getValidRange(this.props.excludedEvents);
    const {
      extendedProps: { config },
    } = eventWithConfig;
    const startTime = moment(config.businessHours.startTime, 'h:mm:ss');
    const endTime = moment(config.businessHours.endTime, 'h:mm:ss');
    return {
      ...config,
      height: 'auto',
      defaultTimedEventDuration: config.slotDuration,
      minTime: config.businessHours.startTime,
      maxTime: config.businessHours.endTime,
      nextDayThreshold: moment
        .duration(endTime.diff(startTime))
        .asMilliseconds(),
      validRange: {
        start: moment(validRange.start)
          .startOf('month')
          .format(),
        end: moment(validRange.end)
          .endOf('month')
          .format(),
      },
      dayRender: ({ date, el }) => {
        if (
          moment(date).isBefore(
            moment(validRange.start).format('YYYY-MM-DD'),
          ) ||
          moment(date).isAfter(moment(validRange.end).format('YYYY-MM-DD'))
        ) {
          el.classList.add('fc-disabled-day');
        }
      },
    } as OptionsInput;
  };

  getAvailabilitySlots = events => {
    const { slotDuration } = this.getCalendarConfig();
    const slots = createAvailabilitySlots(
      this.props.excludedEvents,
      moment.duration(slotDuration),
    );

    const filteredList = slots.filter(
      slot =>
        !events.find(item => {
          const slotStart = moment(slot.start);
          const slotEnd = moment(slot.end);
          //debugger
          const asd = slotStart.isBetween(item.start, item.end);
          return (
            moment(item.start).isSame(slotStart) ||
            asd ||
            slotEnd.isSame(item.end)
          );
        }),
    );

    return filteredList;
  };

  render() {
    const { excludedEvents, fields } = this.props;
    const events = fields.getAll();
    if (!events) {
      return null;
    }
    return (
      <CalendarComponent
        calendarType="edit"
        events={[...excludedEvents, ...events]}
        options={this.getCalendarConfig()}
        availabiltySlots={this.getAvailabilitySlots(events)}
        addEventCb={fields.push}
        removeEventCb={oldID =>
          deleteCalendarBookingEvent(fields, { id: oldID })
        }
      />
    );
  }
}

export const CalendarField = props => (
  <FieldArray name={props.name} component={EditableCalendar} {...props} />
);
