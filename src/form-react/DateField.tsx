import * as React from 'react';
import DatePicker from 'react-16-bootstrap-date-picker';

import { FormField } from './types';

export const DateField = (props: FormField) => {
  return (
    <DatePicker
      {...props.input}
      dateFormat="YYYY-MM-DD"
    />
  );
};
