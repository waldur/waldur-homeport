import { DateInput } from '@fullcalendar/core/datelib/env';
import { EventInput } from '@fullcalendar/core/structs/event';
import { ReactElement } from 'react';

export interface State {
  schedules: EventInput[];
  bookings: EventInput[];
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

export interface TimeSelectProps {
  onChange: (value) => void;
  name: string;
  value: DateInput;
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
  value: DateInput;
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
