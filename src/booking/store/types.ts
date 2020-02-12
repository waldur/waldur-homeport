import {DateInput} from '@fullcalendar/core/datelib/env';
import {EventInput} from '@fullcalendar/core/structs/event';
import {ReactElement} from 'react';

export interface State {
  loading: boolean;
  errors: any[];
  events: EventInput[];
  schedules: object[];
  bookings: object[];
  config: object;
}

export interface TimeSelectProps {
  onChange: (value) => void;
  name: string;
  value: DateInput;
  className?: string | string[];
  interval?: number;
  isDisabled?: boolean;
  label?: string | ReactElement;
}

export interface PureDateProps extends TimeSelectProps {
  withTime?: TimeSelectProps;
}

export interface UpdateProp {
  meta: {
    form: string;
    field: string;
  };
  event: EventInput;
  oldEvent: EventInput;
}
