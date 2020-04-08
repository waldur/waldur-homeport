import { Calendar, OptionsInput } from '@fullcalendar/core';
import moment from 'moment-timezone';
import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  addBooking,
  updateBooking,
  removeBooking,
} from '@waldur/booking/store/actions';
import { BookingProps, State } from '@waldur/booking/types';
import {
  mapBookingEvents,
  handleTime,
  handleTitle,
  handleEventUpdate,
  handleSelect,
  keysOf,
  filterObject,
} from '@waldur/booking/utils';

import BookingModal from '../modal/BookingModal';

import { defaultOptions } from './defaultOptions';

export const getCalendarState = state => state.bookings;

export interface CalendarComponentProps {
  options?: OptionsInput;
  calendarType: 'create' | 'edit' | 'read';

  extraEvents?: BookingProps[];
  addEventCb?: (event: BookingProps) => any;
}

export const CalendarComponent = (props: CalendarComponentProps) => {
  const elRef = React.useRef<HTMLDivElement>(null);
  const calendarRef = React.useRef<Calendar>();
  const oldDate = React.useRef<Date>();
  const oldOptionsRef = React.useRef<OptionsInput>(props.options);

  const calendarState: State = useSelector(getCalendarState);
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

  const mouseEnter = arg =>
    focused !== arg.event.id && setFocused(arg.event.id);

  const mouseLeave = arg => focused === arg.event.id && setFocused('');

  const addEvent = (event: BookingProps) => dispatch(addBooking(event));

  const toggleModal = () => setModal({ isOpen: false, el: null, event: null });

  const updateEvent = arg => {
    const { oldID, event } = handleEventUpdate(arg);
    dispatch(updateBooking({ oldID, event }));
  };

  const handleEventRender = arg => {
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

  React.useEffect(() => {
    const cal = new Calendar(elRef.current!, {
      ...defaultOptions,
      ...calendarState.config,
      select: arg => {
        const event = handleSelect(
          arg,
          props.calendarType === 'create' && 'Availability',
        );
        props.addEventCb(event);
      },
      eventClick: ({ el, event }) => setModal({ isOpen: true, el, event }),
      eventRender: handleEventRender,
    });
    calendarRef.current = cal;
    cal.removeAllEventSources();

    cal.render();
    oldDate.current = getNewDate();

    return () => cal.destroy();
  }, []);

  React.useEffect(() => {
    const cal = calendarRef.current!;
    const newDate = getNewDate();
    const options = {
      ...calendarState.config,
      select: arg =>
        addEvent(
          handleSelect(arg, props.calendarType === 'create' && 'Availability'),
        ),
      eventMouseEnter: mouseEnter,
      eventMouseLeave: mouseLeave,
      eventDrop: updateEvent,
      eventResize: updateEvent,
      eventRender: handleEventRender,
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
      cal.removeAllEventSources();
      cal.addEventSource(
        mapBookingEvents(calendarState.bookings, 'background'),
      );
      cal.addEventSource(mapBookingEvents(calendarState.schedules));

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
    cal.rerenderEvents();
  }, [
    calendarState.config,
    calendarState.schedules,
    calendarRef,
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
          onDelete={() => dispatch(removeBooking(modal.event.id))}
          onSuccess={cb => dispatch(updateBooking(cb))}
        />
      ) : null}
    </div>
  );
};
