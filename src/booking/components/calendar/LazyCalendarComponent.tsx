import { Calendar, OptionsInput } from '@fullcalendar/core';
import moment from 'moment-timezone';
import { useRef, useState, useEffect, FC } from 'react';
import { useDispatch } from 'react-redux';

import { CURSOR_NOT_ALLOWED_CLASSNAME } from '@waldur/booking/constants';
import { BookingProps } from '@waldur/booking/types';
import {
  createBooking,
  keysOf,
  filterObject,
  eventRender,
  transformBookingEvent,
  handleSchedule,
} from '@waldur/booking/utils';
import { translate } from '@waldur/i18n';
import { showSuccess, showError } from '@waldur/store/notify';

import { BookingModal } from '../modal/BookingModal';

import { defaultOptions } from './defaultOptions';
import './Calendar.scss';
import './styles';

interface AvailabilitySlot {
  start: Date | string;
  end: Date | string;
}

export interface CalendarComponentProps {
  calendarType: 'create' | 'edit' | 'read';
  events: BookingProps[];
  availabilitySlots?: AvailabilitySlot[];
  options?: OptionsInput;
  addEventCb?: (event: BookingProps) => any;
  removeEventCb?: (id: BookingProps['id']) => any;
}

export const LazyCalendarComponent: FC<CalendarComponentProps> = (props) => {
  const elRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<Calendar>();
  const oldDate = useRef<Date>();
  const oldOptionsRef = useRef<OptionsInput>(props.options);
  const [hovered, setHovered] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    el: null,
    event: null,
  });
  const dispatch = useDispatch();

  const isCalType = (type: CalendarComponentProps['calendarType']): boolean =>
    props.calendarType === type;

  const getNewDate = () => {
    const calApi = calendarRef.current;
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
      (props.calendarType === 'edit' &&
        event.extendedProps.type === 'Availability') ||
      event.classNames.includes(CURSOR_NOT_ALLOWED_CLASSNAME)
    ) {
      return;
    }
    return setModal({ isOpen: true, el, event });
  };
  const addBooking = (event: BookingProps) => {
    dispatch(showSuccess('Time slot has been added.'));
    return props.addEventCb(event);
  };

  const updateEvent = (arg) => {
    const oldID: BookingProps['id'] =
      (arg.prevEvent && arg.prevEvent.id) || (arg.oldEvent && arg.oldEvent.id);
    props.removeEventCb(oldID);
    addBooking(createBooking(arg.event));
  };

  const handleSelect = (arg) => {
    if (isCalType('create')) {
      const { weekends, slotDuration, businessHours } = props.options;
      const availabilityBooking = createBooking(
        {
          ...arg,
          allDay: arg.view.type === 'dayGridMonth',
          extendedProps: {
            config: { weekends, slotDuration, businessHours },
            type: 'Availability',
          },
        },
        arg.jsEvent.timeStamp,
      );

      return addBooking(availabilityBooking);
    } else if (isCalType('edit')) {
      const calendarApi = calendarRef.current;
      const checkEvents = calendarApi.getEvents();

      const isOverlapping = !!checkEvents.find((event) => {
        return (
          event.rendering !== 'background' &&
          ((event.start >= arg.start && event.start <= arg.end) ||
            (event.end > arg.start && event.end <= arg.end) ||
            (arg.start >= event.start && arg.start < event.end) ||
            (arg.end >= event.start && arg.end <= event.end))
        );
      });

      if (isOverlapping) {
        dispatch(
          showError(
            translate('Booking is not allowed to overlap other bookings.'),
          ),
        );
        return calendarApi.unselect();
      } else {
        const scheduledBooking = handleSchedule(
          arg,
          props.availabilitySlots,
          props.options.slotDuration,
        );
        return addBooking(scheduledBooking);
      }
    }
  };

  const calendarMountEffect = () => {
    const cal = new Calendar(elRef.current, {
      ...defaultOptions,
      ...props.options,
      eventClick,
      editable: !isCalType('read'),
      selectable: !isCalType('read'),
      slotEventOverlap: isCalType('create'),
      eventDataTransform: (event) =>
        transformBookingEvent(event, isCalType('create')),
    });

    calendarRef.current = cal;

    cal.render();
    oldDate.current = getNewDate();

    return () => cal.destroy();
  };

  const calendarUpdateEffect = () => {
    const newDate = getNewDate();

    const options: OptionsInput = {
      ...props.options,
      slotEventOverlap: isCalType('create'),
      selectConstraint: !isCalType('create') ? 'Availability' : null,
      eventConstraint: !isCalType('create') ? 'Availability' : null,
      eventClick,
      select: handleSelect,
      eventDrop: updateEvent,
      eventResize: updateEvent,
      eventRender: (e) => eventRender(e, hovered),
    };

    calendarRef.current.on(
      'eventMouseEnter',
      ({ event }) =>
        event.rendering !== 'background' &&
        hovered !== event.id &&
        setHovered(event.id),
    );

    calendarRef.current.on('eventMouseLeave', () => setHovered(''));

    if (
      newDate != null &&
      (oldDate.current == null ||
        oldDate.current.getTime() !== newDate.getTime())
    ) {
      calendarRef.current.gotoDate(newDate);
      oldDate.current = newDate;
    }

    const oldOptions = oldOptionsRef.current;
    if (oldOptions !== options) {
      const removes = oldOptions
        ? keysOf(oldOptions).filter((optionName) => !(optionName in options))
        : [];

      const updates: Partial<OptionsInput> = oldOptions
        ? filterObject(
            options,
            (propName) => options[propName] != oldOptions[propName],
          )
        : options;

      calendarRef.current.mutateOptions(updates, removes, true);
      oldOptionsRef.current = options;
    }

    calendarRef.current.removeAllEventSources();
    calendarRef.current.addEventSource(props.events);
  };

  useEffect(calendarMountEffect, []);

  useEffect(calendarUpdateEffect, [
    props.events,
    props.options,
    calendarRef,
    hovered,
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
          onSuccess={(cb) => {
            props.removeEventCb(modal.event.id);
            props.addEventCb(cb.event);
          }}
        />
      ) : null}
    </div>
  );
};
