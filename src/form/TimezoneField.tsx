import * as moment from 'moment-timezone';
import * as React from 'react';
import WindowedSelect from 'react-windowed-select';

import { reactSelectMenuPortaling } from '@waldur/form/utils';

function getTimezoneMetadata(timezone: string, timestamp: number) {
  const zonedDate = moment.tz(timestamp, timezone);
  const offset = zonedDate.utcOffset();
  const offsetAsString = zonedDate.format('Z');

  return {
    offset,
    value: timezone,
    label: `${timezone.replace(/_/g, ' ')} (UTC${offsetAsString})`,
  };
}

function getTimezoneItems() {
  const date = new Date();
  const timestamp = date.getTime();
  return moment.tz
    .names()
    .map((timezone) => getTimezoneMetadata(timezone, timestamp))
    .sort((a, b) => a.offset - b.offset);
}

export function getDefaultTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export const TimezoneField = (props) => {
  const { input, ...rest } = props;
  const options = React.useMemo(getTimezoneItems, []);
  return (
    <WindowedSelect
      {...reactSelectMenuPortaling()}
      options={options}
      value={options.find((option) => option.value === input.value)}
      onChange={(option: any) => input.onChange(option.value)}
      onBlur={(event) => event.preventDefault()}
      {...rest}
    />
  );
};
