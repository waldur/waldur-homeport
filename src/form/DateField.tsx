import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import DatePicker from 'react-datepicker';

export const DateField: FunctionComponent<any> = (props) => (
  <DatePicker
    dateFormat="yyyy-MM-dd"
    selected={
      typeof props.input.value === 'string'
        ? DateTime.fromISO(props.input.value).toJSDate()
        : props.input.value
    }
    onChange={props.input.onChange}
    className="form-control"
  />
);
