import { FunctionComponent } from 'react';

import { FormGroup } from '@/form';
import { TimezoneField } from '@/form/TimezoneField';
import { translate } from '@/i18n';

interface TimeZoneGroupProps {
  timeZone: string;
  setTimeZone(val: string): void;
}

export const TimeZoneGroup: FunctionComponent<TimeZoneGroupProps> = ({
  timeZone,
  setTimeZone,
}) => (
  <FormGroup label={translate('Time zone')}>
    <TimezoneField
      isSearchable={true}
      isClearable={false}
      input={{ value: timeZone, onChange: setTimeZone }}
    />
  </FormGroup>
);
