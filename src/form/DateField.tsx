import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import Flatpickr from 'react-flatpickr';

export const DateField: FunctionComponent<any> = (props) => (
  <Flatpickr
    options={{
      dateFormat: 'Y-m-d',
      minDate: props.minDate,
    }}
    value={
      props.input.value && typeof props.input.value === 'string'
        ? DateTime.fromISO(props.input.value).toJSDate()
        : props.input.value
    }
    onChange={(value) => props.input.onChange(value[0])}
    className="form-control form-control-solid"
  />
);
