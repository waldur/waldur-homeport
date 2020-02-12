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
  icon?: boolean;
  interval?: number;
  isDisabled?: boolean;
  label?: string | ReactElement;
}

export interface PureDateProps {
  onChange: (value) => void;
  name: string;
  value: DateInput;
  className?: string | string[];
  isDisabled?: boolean;
  label?: string | ReactElement;
  withTime?: {
    className?: string | string[];
    interval?: number;
    isDisabled?: boolean;
    label?: string | ReactElement;
  };
}

export interface UpdateProps {
  meta: {
    form: string;
    field: string;
  };
  event: EventInput;
  oldEvent: EventInput;
}
