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
      {props.offering.shared ? (
        <CustomerField
          organizationGroups={props.offering.organization_groups}
        />
      ) : (
        props.offering.customer_name
      )}
    </VStepperFormStepCard>
  );
};
