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
    type: string;
    bookingID?: string;
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

export interface WaldurCalendarProps {
  calendarType: 'create' | 'edit' | 'read';
  calendarState: State;

  addBooking: (payload: BookingProps) => void;
  setBookings: (payload: BookingProps[]) => void;
  updateBooking: (payload: {
    oldID: BookingProps['id'];
    event: BookingProps | EventApi;
  }) => void;
  removeBooking: (oldID: BookingProps['id']) => void;

  setModalProps: (props) => void;
  openModal: (cb) => void;
  getAllEvents?: (cb) => void;
  formEvents?: BookingProps[] | Event[];
}

export interface BookingModalProps {
  isOpen: boolean;
  toggle: () => void;
  event: BookingProps | null | undefined;
  onSuccess: (payload: {
    oldID: BookingProps['id'];
    event: BookingProps;
  }) => any;
  onDelete: () => void;
}
