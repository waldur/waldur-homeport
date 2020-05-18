import { Calendar, OptionsInput, EventInput } from '@fullcalendar/core';
import moment from 'moment-timezone';
import * as React from 'react';
import { useSelector } from 'react-redux';

import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/list/main.css';
import '@fullcalendar/timegrid/main.css';

import { BookingProps, State } from '@waldur/booking/types';
import {
  createBooking,
  keysOf,
  filterObject,
  eventRender,
  transformBookingEvent,
  handleSchedule,
} from '@waldur/booking/utils';

import BookingModal from '../modal/BookingModal';

import { defaultOptions } from './defaultOptions';

import './Calendar.scss';

export const getCalendarState = (state): State => state.bookings;

export interface CalendarComponentProps {
  calendarType: 'create' | 'edit' | 'read';
  events: BookingProps[];

  availabiltyEvents?: EventInput[];
  options?: OptionsInput;
  addEventCb?: (event: BookingProps) => any;
  removeEventCb?: (id: BookingProps['id']) => any;
}

export const CalendarComponent = (props: CalendarComponentProps) => {
  const elRef = React.useRef<HTMLDivElement>(null);
  const calendarRef = React.useRef<Calendar>();
  const oldDate = React.useRef<Date>();
  const oldOptionsRef = React.useRef<OptionsInput>(props.options);
  const [modal, setModal] = React.useState({
    isOpen: false,
    el: null,
    event: null,
  });

  const { config } = useSelector(getCalendarState);

  const getApi = (): Calendar => calendarRef.current!;

  const getNewDate = () => {
    const calApi = getApi();
    const datetime = calApi.dateEnv.createMarker(
      props.options && props.options.defaultDate
        ? props.options.defaultDate
        : calApi.getNow(),
    );
    const momentDatetime = moment({
      years: datetime.getFullYear(),
      month: datetime.getMonth(),
      date: datetime.getDate(),
    });
    return momentDatetime.toDate();
  };

  const toggleModal = () => setModal({ isOpen: false, el: null, event: null });

  const eventClick = ({ el, event }) => {
    if (
      props.calendarType !== 'create' &&
      event.extendedProps.type !== 'Availability'
    ) {
      return setModal({ isOpen: true, el, event });
    }
  };

  const updateEvent = arg => {
    const oldID: BookingProps['id'] =
      (arg.prevEvent && arg.prevEvent.id) || (arg.oldEvent && arg.oldEvent.id);
    props.removeEventCb(oldID);
    props.addEventCb(createBooking(arg.event));
  };

  const handleSelect = arg => {
    if (props.calendarType === 'create') {
      const availabiltyBooking = createBooking(
        {
          ...arg,
          allDay: arg.view.type === 'dayGridMonth',
          extendedProps: { config, type: 'Availability' },
        },
        arg.jsEvent.timeStamp,
      );

      return props.addEventCb(availabiltyBooking);
    } else if (props.calendarType === 'edit') {
      const calendarApi = getApi();
      const checkEvents = calendarApi.getEvents();

      checkEvents.forEach(function(event) {
        if (
          event.rendering !== 'background' &&
          ((event.start >= arg.start && event.start <= arg.end) ||
            (event.end >= arg.start && event.end <= arg.end) ||
            (arg.start >= event.start && arg.start <= event.end) ||
            (arg.end >= event.start && arg.end <= event.end))
        ) {
          return calendarApi.unselect();
        }
      });

      const scheduledBooking = handleSchedule(
        arg,
        props.availabiltyEvents,
        config.slotDuration,
      );

      return props.addEventCb(scheduledBooking);
    }
  };

  const calendarMountEffect = () => {
    const cal = new Calendar(elRef.current!, {
      ...defaultOptions,
      ...props.options,
      eventClick,
      events: props.events,
      forceEventDuration: true,
      allDayMaintainDuration: true,
      editable: props.calendarType !== 'read',
      selectable: props.calendarType !== 'read',
      eventDataTransform: event =>
        transformBookingEvent(event, props.calendarType === 'create'),
    });

    calendarRef.current = cal;

    cal.render();
    oldDate.current = getNewDate();

    return () => cal.destroy();
  };

  const calendarUpdateEffect = () => {
    const cal = calendarRef.current!;
    const newDate = getNewDate();

    const options: OptionsInput = {
      ...props.options,
      slotEventOverlap: props.calendarType === 'create',
      select: handleSelect,
      events: props.events,
      //selectConstraint: props.calendarType !== 'create' ? 'Availability' : null,
      //eventConstraint: props.calendarType !== 'create' ? 'Availability' : null,
      eventClick,
      eventDrop: updateEvent,
      eventResize: updateEvent,
      eventRender,
    };

    if (
      newDate != null &&
      (oldDate.current == null ||
        oldDate.current.getTime() !== newDate.getTime())
    ) {
      cal.gotoDate(newDate);
      oldDate.current = newDate;
    }

    const oldOptions = oldOptionsRef.current;
    if (oldOptions !== options) {
      const removes = oldOptions
        ? keysOf(oldOptions).filter(optionName => !(optionName in options))
        : [];

      const updates: Partial<OptionsInput> = oldOptions
        ? filterObject(
            options,
            propName => options[propName] != oldOptions[propName],
          )
        : options;

      cal.mutateOptions(updates, removes, true);
      oldOptionsRef.current = options;
    }

    cal.removeAllEventSources();
    cal.addEventSource(props.events);
  };

  React.useEffect(calendarMountEffect, []);

  React.useEffect(calendarUpdateEffect, [
    props.events,
    calendarRef,
    config,
    modal,
  ]);

  return (
    <div className="calendar-container">
      <div ref={elRef} />
      {modal.el ? (
        <BookingModal
          isOpen={modal.isOpen}
          toggle={toggleModal}
          event={modal.event}
          onDelete={() => props.removeEventCb(modal.event.id)}
          onSuccess={cb => {
            props.removeEventCb(modal.event.id);
            props.addEventCb(cb.event);
          }}
        />
      ) : null}
    </div>
  );
};
