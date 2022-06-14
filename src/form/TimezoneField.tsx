import { DateTime } from 'luxon';
import { useMemo, FunctionComponent } from 'react';

import { TIMEZONES } from '@waldur/core/timezones';
import { WindowedSelect } from '@waldur/form/themed-select';

function getTimezoneMetadata(zone: string) {
  const zonedDate = DateTime.utc().setZone(zone);
  const offsetAsString = zonedDate.toFormat('Z');

  return {
    offset: zonedDate.offset,
    value: zone,
    label: `${zone.replace(/_/g, ' ')} (UTC${offsetAsString})`,
  };
}

function getTimezoneItems() {
  return TIMEZONES.map(getTimezoneMetadata).sort((a, b) => a.offset - b.offset);
}

export function getDefaultTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export const TimezoneField: FunctionComponent<any> = (props) => {
  const { input, ...rest } = props;
  const options = useMemo(getTimezoneItems, []);
  return (
    <WindowedSelect
      options={options}
      value={options.find((option) => option.value === input.value)}
      onChange={(option: any) => input.onChange(option.value)}
      onBlur={(event) => event.preventDefault()}
      {...rest}
    />
  );
};
