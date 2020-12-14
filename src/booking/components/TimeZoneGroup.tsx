import moment from 'moment-timezone';
import { FunctionComponent } from 'react';
import Select from 'react-select';

import { reactSelectMenuPortaling } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

const timeZoneArray = moment.tz
  .names()
  .map((zone) => ({ value: zone, label: zone }));

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
    <Select
      name="timeZone"
      isSearchable={true}
      isClearable={false}
      options={timeZoneArray}
      value={timeZoneArray.filter(({ value }) => value === timeZone)}
      onChange={(newValue: any) => setTimeZone(newValue.value)}
      {...reactSelectMenuPortaling()}
    />
  </FormGroup>
);
