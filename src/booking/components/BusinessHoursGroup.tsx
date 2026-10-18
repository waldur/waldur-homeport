import { ClockIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { FormField, FormLabel } from 'waldur-ui';

import { FormGroup } from '@/form';
import { Select } from '@/form/select';
import { getOptions } from '@/form/TimeSelectField';
import { translate } from '@/i18n';

interface BusinessHoursGroupProps {
  startTime: string;
  endTime: string;
  setStartTime(value: string): void;
  setEndTime(value: string): void;
}

export const BusinessHoursGroup: FunctionComponent<BusinessHoursGroupProps> = ({
  startTime,
  endTime,
  setStartTime,
  setEndTime,
}) => (
  <FormGroup
    group
    label={translate('Business hours')}
    help={translate('Daily available booking time range')}
  >
    <FormField>
      <FormLabel className="svg-icon svg-icon-2">
        <ClockIcon weight="bold" />
        <span className="sr-only">{translate('From')}</span>
      </FormLabel>
      <Select
        instanceId="startTime"
        name="startTime"
        isSearchable={false}
        isClearable={false}
        isMulti={false}
        options={getOptions(60)}
        value={getOptions(60).filter(({ value }) => value === startTime)}
        onChange={(option: any) => setStartTime(option.value)}
      />
    </FormField>

    <FormField>
      <FormLabel>{translate('till')}</FormLabel>
      <Select
        instanceId="endTime"
        name="endTime"
        isSearchable={false}
        isClearable={false}
        isMulti={false}
        options={[...getOptions(60), { value: '24:00', label: '24:00' }]}
        value={[...getOptions(60), { value: '24:00', label: '24:00' }].filter(
          ({ value }) => value === endTime,
        )}
        onChange={(option: any) => setEndTime(option.value)}
      />
    </FormField>
  </FormGroup>
);
