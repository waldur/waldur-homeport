import { FunctionComponent } from 'react';

import { formatISOWithoutZone } from '@waldur/core/dateUtils';
import { required } from '@waldur/core/validators';
import { FormContainer, NumberField, SelectField } from '@waldur/form';
import { DateTimeField } from '@waldur/form/DateTimeField';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import {
  getCallAllocationStrategyOptions,
  getCallAllocationTimesOptions,
} from '@waldur/proposals/utils';

const FIXED_DATE_OPTION = getCallAllocationTimesOptions().find(
  (op) => op.label === 'Fixed date',
).value;

export const WizardFormThirdPage: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const showAllocationDate =
          wizardProps.formValues?.allocation_time === FIXED_DATE_OPTION;
        return (
          <FormContainer
            submitting={wizardProps.submitting}
            clearOnUnmount={false}
          >
            <SelectField
              name="deciding_entity"
              label={translate('Deciding entity')}
              simpleValue={true}
              options={getCallAllocationStrategyOptions()}
              required={true}
              isClearable={false}
              validate={required}
            />
            <NumberField
              label={translate('Maximum accepted proposals')}
              name="max_allocations"
              required
              validate={required}
            />
            <NumberField
              label={translate('Minimum average scoring for allocation')}
              name="minimal_average_scoring"
              required
              validate={required}
            />
            <SelectField
              name="allocation_time"
              label={translate('Allocation time')}
              simpleValue={true}
              options={getCallAllocationTimesOptions()}
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
        );
      }}
    </WizardForm>
  );
};
