import { FunctionComponent } from 'react';
import { useFormState } from 'react-final-form';

import { formatISOWithoutZone } from '@/core/dateUtils';
import { required } from '@/core/validators';
import { DateTimeGroup } from '@/form';
import { translate } from '@/i18n';
import { AllocationTime } from '@/proposals/types';
import { WizardForm, WizardFormStepProps } from '@/wizard';

interface WizardFormThirdPageProps extends WizardFormStepProps {
  // The call's allocation-timing mode, configured on the allocation_decision
  // workflow step. The round only needs a date when the call allocates on a
  // fixed date.
  allocationMode?: AllocationTime;
}

export const WizardFormThirdPage: FunctionComponent<
  WizardFormThirdPageProps
> = ({ allocationMode, ...props }) => {
  const { submitting } = useFormState({ subscription: { submitting: true } });

  const showAllocationDate = allocationMode === 'fixed_date';
  return (
    <WizardForm {...props}>
      <div className="size-sm">
        {showAllocationDate ? (
          <DateTimeGroup
            label={translate('Allocation date')}
            name="allocation_date"
            required
            validate={required}
            dateFormat="Y-m-d H:i"
            parse={(value) => (value ? formatISOWithoutZone(value) : value)}
            format={(value) => (value ? new Date(value) : value)}
            disabled={submitting}
          />
        ) : (
          <p className="text-muted mb-0">
            {translate(
              'This call allocates on decision — no allocation date is needed. Change the allocation timing on the Configuration tab to set a fixed date.',
            )}
          </p>
        )}
      </div>
    </WizardForm>
  );
};
