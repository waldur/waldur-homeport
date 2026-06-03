import { FunctionComponent } from 'react';
import { useFormState } from 'react-final-form';

import { formatISOWithoutZone } from '@/core/dateUtils';
import { required } from '@/core/validators';
import { DateTimeGroup, SelectGroup, NumberGroup } from '@/form';
import { translate } from '@/i18n';
import {
  getRoundAllocationStrategyOptions,
  getRoundAllocationTimeOptions,
} from '@/proposals/utils';
import { WizardForm, WizardFormStepProps } from '@/wizard';

export const WizardFormThirdPage: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  const { values, submitting } = useFormState({
    subscription: { values: true, submitting: true },
  });

  const showAllocationDate = values?.allocation_time === 'fixed_date';
  const showMinAverageScoring = values?.deciding_entity != 'by_call_manager';
  return (
    <WizardForm {...props}>
      <div className="size-sm">
        <SelectGroup
          name="deciding_entity"
          label={translate('Deciding entity')}
          simpleValue={true}
          options={getRoundAllocationStrategyOptions()}
          required={true}
          isClearable={false}
          validate={required}
          disabled={submitting}
        />

        {showMinAverageScoring && (
          <NumberGroup
            label={translate('Minimum average scoring for allocation')}
            name="minimal_average_scoring"
            required
            validate={required}
            disabled={submitting}
          />
        )}
        <SelectGroup
          name="allocation_time"
          label={translate('Allocation time')}
          simpleValue={true}
          options={getRoundAllocationTimeOptions()}
          required={true}
          isClearable={false}
          validate={required}
          disabled={submitting}
        />

        {showAllocationDate && (
          <DateTimeGroup
            label={translate('Allocation date')}
            name="allocation_date"
            required
            validate={required}
            dateFormat="Y-m-d H:i"
            parse={(value) => (value ? formatISOWithoutZone(value) : value)}
            format={(value) => (value ? new Date(value) : value)}
          />
        )}
      </div>
    </WizardForm>
  );
};
