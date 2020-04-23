import { Calendar, OptionsInput } from '@fullcalendar/core';
import moment from 'moment-timezone';
import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { setSettings } from '@waldur/booking/store/actions';
import { BookingProps, State } from '@waldur/booking/types';
import {
  handleEventUpdate,
  createBooking,
  keysOf,
  filterObject,
  handleSelect,
} from '@waldur/booking/utils';

import BookingModal from '../modal/BookingModal';

import { eventRender, transformBookingEvent } from './CalendarHelpers';
import { defaultOptions } from './defaultOptions';

export const getCalendarState = state => state.bookings;
export interface CalendarComponentProps {
  calendarType: 'create' | 'edit' | 'read';
  extraEvents?: BookingProps[];
  options?: OptionsInput;
  addEventCb?: (event: BookingProps) => any;
  removeEventCb?: (id: BookingProps['id']) => any;
  timeSlots?: (cb) => any;
}

export const CalendarComponent = (props: CalendarComponentProps) => {
  const elRef = React.useRef<HTMLDivElement>(null);
  const calendarRef = React.useRef<Calendar>();
  const oldDate = React.useRef<Date>();
  const oldOptionsRef = React.useRef<OptionsInput>(props.options);

  const { config }: State = useSelector(getCalendarState);
  const dispatch = useDispatch();

  const [modal, setModal] = React.useState({
    isOpen: false,
    el: null,
    event: null,
  });
  const [focused, setFocused] = React.useState('');

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

  const isAvailabilityEvent = event =>
    event.type || event.extendedProps.type === 'Availability';

  const eventMouseEnter = ({ event: { id } }) =>
    focused !== id && setFocused(id);

  const eventMouseLeave = ({ event }) => focused === event.id && setFocused('');

  const eventClick = ({ el, event }) => {
    if (
      props.calendarType !== 'create' &&
      event.extendedProps.type === 'Availability'
    ) {
      return;
    }
    setModal({ isOpen: true, el, event });
  };

  const updateEvent = arg => {
    const { oldID, event } = handleEventUpdate(arg);
    props.removeEventCb(oldID);
    props.addEventCb(createBooking(event));
  };

  const handleConfig = () => {
    if (props.calendarType === 'create') {
      return config;
    } else {
      const availabilityEvents = props.extraEvents.filter(isAvailabilityEvent);
      const newConfig = availabilityEvents.map(
        event => event.extendedProps.config,
      );
      const { extendedProps } = availabilityEvents[0];
      dispatch(setSettings(extendedProps.config));
      return newConfig && newConfig[0];
    }
  };

  const calendarDidMount = () => {
    const cal = new Calendar(elRef.current!, {
      ...defaultOptions,
      ...handleConfig(),
      eventClick,
      editable: props.calendarType !== 'read',
      selectable: props.calendarType !== 'read',
      eventRender: arg => eventRender(arg, focused),
      eventDataTransform: event =>
        transformBookingEvent(event, props.calendarType === 'create'),
    });

    calendarRef.current = cal;

    calendarRef.current.removeAllEventSources();
    if (props.extraEvents.length) {
      calendarRef.current.addEventSource(props.extraEvents);
    }

    cal.render();
    oldDate.current = getNewDate();

    return () => cal.destroy();
  };

  const calendarDidUpdate = () => {
    const cal = calendarRef.current!;
    const newDate = getNewDate();
    const availabilityEvents = props.extraEvents.filter(isAvailabilityEvent);

    cal.removeAllEventSources();
    cal.addEventSource(props.extraEvents);
    const options = {
      ...handleConfig(),
      defaultTimedEventDuration: config.slotDuration,
      scrollTime: config.businessHours.startTime,
      slotEventOverlap: props.calendarType === 'create',
      selectConstraint:
        props.calendarType !== 'create' ? availabilityEvents : null,
      selectOverlap: isAvailabilityEvent,
      eventOverlap: false,
      eventConstraint: 'businessHours',
      select: arg => props.addEventCb(handleSelect(arg, props.calendarType)),
      eventRender: arg => eventRender(arg, focused),
      eventMouseEnter,
      eventMouseLeave,
      eventDrop: updateEvent,
      eventResize: updateEvent,
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
  };

  React.useEffect(calendarDidMount, []);
  React.useEffect(calendarDidUpdate, [
    props.extraEvents,
    calendarRef,
    config,
    focused,
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
