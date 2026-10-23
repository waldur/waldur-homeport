import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import {
  DateBound,
  DatePicker,
  DatePickerProps,
  parseDateValue,
} from 'waldur-ui';

import { FormField } from './types';
import { useDateFieldA11y } from './useDateFieldA11y';

interface DateFieldProps extends FormField {
  minDate?: DateBound;
  maxDate?: DateBound;
  /** Only days matching one of these are selectable. */
  enable?: Array<(date: Date) => boolean>;
  /** Always-visible calendar instead of a popup. */
  inline?: boolean;
  /** `'dropdown'` adds month/year dropdowns — e.g. for a birth date. */
  captionLayout?: DatePickerProps['captionLayout'];
  placeholder?: string;
  solid?: boolean;
  /** Open the calendar on mount — set by the table's date filters. */
  autoOpen?: boolean;
}

/** A calendar date, stored in form state as an ISO date (`yyyy-MM-dd`). */
export const DateField: FunctionComponent<DateFieldProps> = ({
  input,
  minDate,
  maxDate,
  enable,
  inline,
  captionLayout,
  placeholder,
  solid,
  disabled,
  autoOpen,
  id,
  meta,
  isInvalid,
}) => {
  const { ariaProps, onEntryErrorChange } = useDateFieldA11y(
    meta,
    isInvalid,
    input.name,
  );
  return (
    <DatePicker
      value={parseDateValue(input.value)}
      onChange={(date) =>
        input.onChange(date ? DateTime.fromJSDate(date).toISODate() : null)
      }
      onClose={() => input.onBlur?.()}
      minDate={minDate}
      maxDate={maxDate}
      enable={enable}
      inline={inline}
      captionLayout={captionLayout}
      placeholder={placeholder}
      solid={solid}
      disabled={disabled}
      autoOpen={autoOpen}
      id={id}
      onEntryErrorChange={onEntryErrorChange}
      {...ariaProps}
    />
  );
};
