import moment from 'moment-timezone';

import { formatTime } from '@waldur/core/dateUtils';
import { SelectField } from '@waldur/form';
import { FormField } from '@waldur/form/types';

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

export const getOptions = (interval: number) =>
  getMomentDayRange(interval)
    .map(formatTime)
    .map((formattedOption) => ({
      label: formattedOption,
      value: formattedOption,
    }));

interface TimeSelectFieldProps {
  interval?: number;
}

export const TimeSelectField = (props: TimeSelectFieldProps & FormField) => {
  return (
    <SelectField
      simpleValue={true}
      options={getOptions(props.interval)}
      {...props}
    />
  );
};
