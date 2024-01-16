import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import Flatpickr, { DateTimePickerProps } from 'react-flatpickr';

import { FormField } from './types';

type DateTimeFieldProps = FormField & DateTimePickerProps['options'];

export const DateTimeField: FunctionComponent<DateTimeFieldProps> = (props) => (
  <Flatpickr
    options={{
      enableTime: true,
      dateFormat: props.dateFormat || 'Z',
      minDate: props.minDate,
    }}
    value={
      props.input.value && typeof props.input.value === 'string'
        ? DateTime.fromISO(props.input.value).toJSDate()
        : props.input.value
    }
    onChange={(value) =>
      props.input.onChange(
        value[0] instanceof Date
          ? DateTime.fromJSDate(value[0]).toISO()
          : value[0],
      )
    }
    className="form-control form-control-solid"
  />
);
