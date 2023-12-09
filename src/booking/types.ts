type DateInput = Date | string | number | number[];

export interface EventInput {
  start?: DateInput;
  end?: DateInput;
  date?: DateInput;
  allDay?: boolean;
  id?: string | number;
  groupId?: string | number;
  title?: string;
  url?: string;
  editable?: boolean;
  rendering?: string;
  extendedProps?: any;
}

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
  name: string;
  state: string;
  attributes: {
    schedules: EventInput[];
  };
  customer_name: string;
  customer_uuid: string;
  project_name: string;
  project_description: string;
  provider_uuid: string;
  description: string;
  created: string;
  approved_by_full_name: string;
  created_by_full_name: string;
  created_by_username: string;
}

export interface BookedItem {
  start: string;
  end: string;
  created_by_full_name: string;
}
