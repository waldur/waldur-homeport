import type { OptionsInput } from '@fullcalendar/core';
import moment from 'moment';
import * as React from 'react';
import { FieldArray } from 'redux-form';

import { CalendarComponent } from '@waldur/booking/components/calendar/CalendarComponent';
import { EditableCalendarProps } from '@waldur/booking/types';
import {
  deleteCalendarBooking,
  createAvailabilitySlots,
  createAvailabilityDates,
} from '@waldur/booking/utils';

export class EditableCalendar extends React.Component<
  EditableCalendarProps,
  { availabilitySlots }
> {
  constructor(props) {
    super(props);
    this.state = {
      availabilitySlots: this.getAvailabilitySlots(props.fields.getAll() || []),
    };
  }

  getValidRange = (events) => ({
    start: Math.min(...events.map((event) => moment(event.start).valueOf())),
    end: Math.max(...events.map((event) => moment(event.end).valueOf())),
  });

  getCalendarConfig = () => {
    const configWithEvent = this.props.excludedEvents.find(
      ({ extendedProps }) => {
        if (extendedProps.type === 'Availability' && extendedProps.config) {
          return extendedProps.config;
        }
      },
    );
    if (!configWithEvent) {
      return null;
    }
    const validRange = this.getValidRange(this.props.excludedEvents);
    const { config } = configWithEvent.extendedProps!;

    return (
      config! &&
      ({
        ...config,
        height: 'auto',
        displayEventEnd: true,
        nowIndicator: true,
        defaultTimedEventDuration: config.slotDuration,
        scrollTime: config.businessHours.startTime,
        minTime: config.businessHours.startTime,
        maxTime: config.businessHours.endTime,
        validRange: {
          start: moment(validRange.start).startOf('month').format(),
          end: moment(validRange.end).endOf('month').format(),
        },
        dayRender: ({ date, el }) => {
          const curDate = moment(date);
          if (
            curDate.isBefore(moment(validRange.start).format('YYYY-MM-DD')) ||
            curDate.isAfter(moment(validRange.end).format('YYYY-MM-DD'))
          ) {
            el.classList.add('fc-nonbusiness');
          }
        },
      } as OptionsInput)
    );
  };

  updateAvailabilitySlotsAfterEventWasAdded = (addedEvent) => {
    this.setState({
      ...this.state,
      availabilitySlots: this.state.availabilitySlots.filter(
        (slot) =>
          moment(slot.start).isBefore(moment(addedEvent.start)) ||
          moment(slot.end).isAfter(moment(addedEvent.end)),
      ),
    });
  };

  updateAvailabilitySlotsAfterEventWasRemoved = (removedEvent) => {
    const config = this.getCalendarConfig();
    const removedSlot = createAvailabilitySlots(
      [removedEvent],
      moment.duration(config.slotDuration),
    );
    this.setState({
      ...this.state,
      availabilitySlots: [...this.state.availabilitySlots, ...removedSlot],
    });
  };

  getAvailabilitySlots = (events) => {
    const config = this.getCalendarConfig();
    if (!config) {
      return [];
    }
    const availability = [];

    this.props.excludedEvents.map((event) =>
      availability.push(...createAvailabilityDates(event)),
    );

    const slots = createAvailabilitySlots(
      availability,
      moment.duration(config.slotDuration),
    );

    return slots.filter(
      (slot) =>
        !events.find((item) => {
          const slotStart = moment(slot.start);
          const slotEnd = moment(slot.end);

          return (
            moment(item.start).isSame(slotStart) ||
            slotStart.isBetween(item.start, item.end) ||
            slotEnd.isSame(item.end)
          );
        }),
    );
  };

  render() {
    const { excludedEvents, fields } = this.props;
    let events = fields.getAll();
    if (!events) {
      events = [];
    }
    return (
      <CalendarComponent
        calendarType="edit"
        events={[...excludedEvents, ...events]}
        options={this.getCalendarConfig()}
        availabiltySlots={this.state.availabilitySlots}
        addEventCb={(addedEvent) => {
          this.updateAvailabilitySlotsAfterEventWasAdded(addedEvent);
          return fields.push(addedEvent);
        }}
        removeEventCb={(oldID) => {
          const removedEvent = deleteCalendarBooking(fields, { id: oldID });
          this.updateAvailabilitySlotsAfterEventWasRemoved(removedEvent);
        }}
      />
    );
  }
}

export const CalendarField = (props) => (
  <FieldArray name={props.name} component={EditableCalendar} {...props} />
);
