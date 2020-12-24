import { FunctionComponent, useMemo } from 'react';
import Select from 'react-select';

import { reactSelectMenuPortaling } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { LanguageUtilsService } from '@waldur/i18n/LanguageUtilsService';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { getDurationOptions } from '../utils';

interface SlotDurationGroupProps {
  slotDuration: string;
  setSlotDuration(val: string): void;
}

export const SlotDurationGroup: FunctionComponent<SlotDurationGroupProps> = ({
  slotDuration,
  setSlotDuration,
}) => {
  const locale = LanguageUtilsService.getCurrentLanguage().code;

  const durationOptions = useMemo(() => getDurationOptions(locale), [locale]);

  return (
    <FormGroup
      label={translate('Time slot')}
      labelClassName="control-label col-sm-3"
      valueClassName={'col-sm-8'}
      description={translate('Minimum booking time slot duration.')}
    >
      <Select
        name="timeSlotSelect"
        isSearchable={false}
        isClearable={false}
        isMulti={false}
        options={durationOptions}
        value={durationOptions.filter(({ value }) => value === slotDuration)}
        onChange={(newValue: any) => setSlotDuration(newValue.value)}
        {...reactSelectMenuPortaling()}
      />
    </FormGroup>
  );
};
