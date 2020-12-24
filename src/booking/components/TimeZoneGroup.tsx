import { FunctionComponent } from 'react';

import { TimezoneField } from '@waldur/form/TimezoneField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

interface TimeZoneGroupProps {
  timeZone: string;
  setTimeZone(val: string): void;
}

export const TimeZoneGroup: FunctionComponent<TimeZoneGroupProps> = ({
  timeZone,
  setTimeZone,
}) => (
  <FormGroup
    label={translate('Time zone')}
    labelClassName="control-label col-sm-3"
    valueClassName={'col-sm-8'}
  >
    <TimezoneField
      isSearchable={true}
      isClearable={false}
      input={{ value: timeZone, onChange: setTimeZone }}
    />
  </FormGroup>
);
