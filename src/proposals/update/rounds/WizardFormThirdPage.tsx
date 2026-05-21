import { FunctionComponent } from 'react';
import { useFormState } from 'react-final-form';

import { formatISOWithoutZone } from '@/core/dateUtils';
import { required } from '@/core/validators';
import { FormContainer, NumberField, SelectField } from '@/form';
import { DateTimeField } from '@/form/DateTimeField';
import { WizardFormStepProps } from '@/form/WizardForm';
import { WizardForm } from '@/form/WizardForm';
import { translate } from '@/i18n';
import {
  getRoundAllocationStrategyOptions,
  getRoundAllocationTimeOptions,
} from '@/proposals/utils';

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
      <FormContainer submitting={submitting}>
        <SelectField
          name="deciding_entity"
          label={translate('Deciding entity')}
          simpleValue={true}
          options={getRoundAllocationStrategyOptions()}
          required={true}
          isClearable={false}
          validate={required}
        />

        {showMinAverageScoring && (
          <NumberField
            label={translate('Minimum average scoring for allocation')}
            name="minimal_average_scoring"
            required
            validate={required}
          />
        )}
        <SelectField
          name="allocation_time"
          label={translate('Allocation time')}
          simpleValue={true}
          options={getRoundAllocationTimeOptions()}
          required={true}
          isClearable={false}
          validate={required}
        />

        {showAllocationDate && (
          <DateTimeField
            label={translate('Allocation date')}
            name="allocation_date"
            required
            validate={required}
            dateFormat="Y-m-d H:i"
            parse={(value) => (value ? formatISOWithoutZone(value) : value)}
            format={(value) => (value ? new Date(value) : value)}
          />
        )}
      </FormContainer>
    </WizardForm>
  );
};
