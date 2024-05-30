import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { CustomerField } from '@waldur/marketplace/details/CustomerField';

import { FormStepProps } from '../types';

export const FormCustomerStep = (props: FormStepProps) => {
  return (
    <VStepperFormStepCard
      title={translate('Organization')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
      required={props.required}
    >
      <CustomerField />
    </VStepperFormStepCard>
  );
};
