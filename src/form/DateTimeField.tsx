import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';

import { DateBound, DatePicker, parseDateValue } from 'waldur-ui';

import { FormField } from './types';

interface DateTimeFieldProps extends FormField {
  minDate?: DateBound;
  maxDate?: DateBound;
  placeholder?: string;
  solid?: boolean;
  /** Open the calendar on mount — set by the table's date filters. */
  autoOpen?: boolean;
}

/**
 * A date and time of day, stored in form state as a local ISO datetime with
 * offset (`2026-06-15T08:30:00.000+03:00`) and shown as `yyyy-MM-dd HH:mm`.
 */
export const DateTimeField: FunctionComponent<DateTimeFieldProps> = ({
  input,
  minDate,
  maxDate,
  placeholder,
  solid,
  disabled,
  autoOpen,
  id,
}) => (
  <DatePicker
    enableTime
    value={parseDateValue(input.value)}
    onChange={(date) =>
      input.onChange(date ? DateTime.fromJSDate(date).toISO() : null)
    }
    onClose={() => input.onBlur?.()}
    minDate={minDate}
    maxDate={maxDate}
    placeholder={placeholder}
    solid={solid}
    disabled={disabled}
    autoOpen={autoOpen}
    id={id}
  />
);
