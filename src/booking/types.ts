import type { EventInput } from '@fullcalendar/core';

export interface BookingState {
  schedules: BookingProps[];
  bookings: BookingProps[];
  config: ConfigProps;
}

export interface ConfigProps {
  weekends: boolean;
  businessHours: {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
  };
  slotDuration: string;
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

export interface BookingResource {
  uuid: string;
  state: string;
  attributes: {
    schedules: EventInput[];
  };
  project_name: string;
  project_description: string;
  description: string;
  created: string;
}

export interface BookedItem {
  start: string;
  end: string;
}
