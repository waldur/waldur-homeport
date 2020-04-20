import { Calendar, OptionsInput } from '@fullcalendar/core';
import moment from 'moment-timezone';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { BookingProps, State } from '@waldur/booking/types';
import {
  handleTime,
  handleTitle,
  handleEventUpdate,
  handleSelect,
  createBooking,
  keysOf,
  filterObject,
  transformBookingEvent,
  createTimeSlots,
} from '@waldur/booking/utils';

import BookingModal from '../modal/BookingModal';

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
  const eventMouseEnter = ({ event }) =>
    focused !== event.id && setFocused(event.id);
  const eventMouseLeave = ({ event }) => focused === event.id && setFocused('');

  const select = arg => {
    const event = handleSelect(arg, props.calendarType);

    if (props.calendarType === 'edit') {
      return props.addEventCb(event);
    }

    if (props.calendarType === 'create') {
      const eventSlots = createTimeSlots(arg, config, event);
      return props.timeSlots(eventSlots);
    }
  };

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

  const eventRender = arg => {
    if (arg.el && arg.el.classList.contains('fc-event')) {
      if (focused === arg.event.id) {
        arg.el.classList.add('isHovered');
      }
      if (arg.view.type === 'dayGridMonth') {
        handleTime(arg);
        handleTitle(arg);
      }
      return arg.el;
    }
  };

  const handleConfig = () => {
    if (props.calendarType !== 'create') {
      return {
        ...config,
        minTime: config.businessHours.startTime,
        maxTime: config.businessHours.endTime,
      };
    } else return config;
  };

  React.useEffect(() => {
    const eventConstraint = props.extraEvents.filter(
      event => event.type || event.extendedProps.type === 'Availability',
    );
    const newConfig = eventConstraint.map(event => event.extendedProps.config);
    const addConfig = !newConfig && newConfig[0];
    const cal = new Calendar(elRef.current!, {
      ...defaultOptions,
      ...handleConfig(),
      ...addConfig,
      eventClick,
      eventRender,
      allDaySlot: props.calendarType === 'create',
      editable: props.calendarType !== 'read',
      selectable: props.calendarType !== 'read',
      eventConstraint: eventConstraint,
      selectOverlap: event => event.extendedProps.type === 'Availability',
      eventDataTransform: event =>
        transformBookingEvent(event, props.calendarType === 'create'),
    });
    calendarRef.current = cal;

    calendarRef.current.removeAllEventSources();
    if (props.extraEvents) {
      calendarRef.current.addEventSource(props.extraEvents);
    }

    cal.render();
    oldDate.current = getNewDate();

    return () => cal.destroy();
  }, []);

  React.useEffect(() => {
    const cal = calendarRef.current!;
    const newDate = getNewDate();
    const eventConstraint = props.extraEvents.filter(
      event => event.type || event.extendedProps.type === 'Availability',
    );
    const newConfig = eventConstraint.map(event => event.extendedProps.config);
    const constraint = props.extraEvents.filter(
      event => event.type || event.extendedProps.type === 'Availability',
    );
    const addConf = newConfig && newConfig[0];
    cal.removeAllEventSources();
    cal.addEventSource(props.extraEvents);
    const options = {
      ...handleConfig(),
      ...addConf,
      select,
      slotEventOverlap: false,
      eventMouseEnter,
      eventMouseLeave,
      eventDrop: updateEvent,
      eventResize: updateEvent,
      eventRender,
      selectOverlap: event => event.extendedProps.type === 'Availability',
      selectConstraint: props.calendarType === 'edit' ? constraint : null,
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
  }, [props.extraEvents, calendarRef, config, focused, modal]);

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
