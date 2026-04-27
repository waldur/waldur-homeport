import { DateTime } from 'luxon';

import { formatTime } from '@/core/dateUtils';
import { SelectField } from '@/form';
import { FormField } from '@/form/types';

function getMomentDayRange(interval = 5) {
  let start = DateTime.utc().startOf('day');
  const end = DateTime.utc().endOf('day');

  const timeArray = [];

  while (start <= end) {
    timeArray.push(start);
    start = start.plus({ minutes: interval });
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
