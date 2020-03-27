import { EventInput, EventApi } from '@fullcalendar/core';
import { ReactElement } from 'react';

export interface State {
  schedules: BookingProps[];
  bookings: BookingProps[];
  config: ConfigProps;
}

export interface ConfigProps {
  weekends?: boolean;
  businessHours?: {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
  };
  slotDuration?: string;
  minTime?: string;
  maxTime?: string;
  hiddenDays?: number[];
}

export interface BookingProps extends EventInput {
  extendedProps: {
    uniqueID: string;
    type?: string;
    config?: ConfigProps;
  };
}

export interface TimeSelectProps {
  onChange: (value) => void;
  name: string;
  value: Date | string | number | number[];
  className?: string | string[];
  icon?: boolean;
  interval?: number;
  isDisabled?: boolean;
  label?: string | ReactElement;
  options?: any[];
}

export interface PureDateProps {
  onChange: (value) => void;
  name: string;
  value: Date | string | number | number[];
  className?: string | string[];
  isDisabled?: boolean;
  label?: string | ReactElement;
  withTime?:
    | {
        className?: string | string[];
        interval?: number;
        isDisabled?: boolean;
        label?: string | ReactElement;
      }
    | boolean;
}

export interface EditableCalendarProps {
  onSelectDate: (event) => void;
  calendar: State;
  formEvents?: EventInput[];
  onEventClick: (event) => void;
  eventDrop?: (event) => void;
  eventResize?: (event) => void;
  calendarType: 'create' | 'edit' | 'read';
  updateCallback: ({ event, oldId, formID }) => void;
}

export interface WaldurCalendarProps {
  calendarType: 'create' | 'edit' | 'read';
  calendarState: State;

  setBookings: (payload: BookingProps[]) => void;
  addBooking: (payload: BookingProps) => void;
  updateBooking: (payload: {
    oldId: string;
    event: BookingProps | EventApi;
  }) => void;
  removeBooking: (oldId: string) => void;

  setModalProps: (props) => void;
  openModal: (cb) => void;
  getAllEvents: (cb) => void;
}
