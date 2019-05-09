import * as moment from 'moment-timezone';
import * as React from 'react';

import { formatTime } from '@waldur/core/dateUtils';
import { SelectField } from '@waldur/form-react';
import { FormField } from '@waldur/form-react/types';

function getMomentDayRange(interval = 5) {
  const start = moment.utc().startOf('day');
  const end = moment.utc().endOf('day');

  const timeArray = [];

  while (start <= end) {
    timeArray.push(start.clone());
    start.add(interval, 'minutes');
  }
  return timeArray;
}

const options = getMomentDayRange()
  .map(formatTime)
  .map(formattedOption => ({
    label: formattedOption,
    value: formattedOption,
  }));

export const TimeSelectField = (props: FormField) => {
  return (
    <SelectField
      options={options}
      {...props}
    />
  );
};
