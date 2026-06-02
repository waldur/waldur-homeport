import { FunctionComponent, useMemo } from 'react';

import { FormGroup } from '@/form';
import { Select } from '@/form/select';
import { translate } from '@/i18n';

import { getDurationOptions } from '../utils';

interface SlotDurationGroupProps {
  slotDuration: string;
  setSlotDuration(val: string): void;
}

export const SlotDurationGroup: FunctionComponent<SlotDurationGroupProps> = ({
  slotDuration,
  setSlotDuration,
}) => {
  const durationOptions = useMemo(getDurationOptions, []);

  return (
    <FormGroup
      label={translate('Time slot')}
      help={translate('Minimum booking time slot duration.')}
    >
      <Select
        name="timeSlotSelect"
        isSearchable={false}
        isClearable={false}
        isMulti={false}
        options={durationOptions}
        value={durationOptions.filter(({ value }) => value === slotDuration)}
        onChange={(newValue: any) => setSlotDuration(newValue.value)}
      />
    </FormGroup>
  );
};
