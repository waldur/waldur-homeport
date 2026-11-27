import { StepAccordionCard } from 'waldur-ui';

import { getAllModelsOption } from '@/marketplace/common/modelSelection';
import { OptionsForm } from '@/marketplace/common/OptionsForm';

import { useOrderFormData } from '../selectors';
import { FormStepProps } from '../types';

export const FormAdditionalConfigurationStep = (props: FormStepProps) => {
  const { customer } = useOrderFormData();

  return (
    <StepAccordionCard
      disabled={props.disabled}
      disabledReason={props.disabledReason}
      title={props.title}
      id={props.id}
      defaultOpen
    >
      <OptionsForm
        options={props.offering.options}
        offeringUuid={props.offering.uuid}
        customer={customer}
        allModelsOption={getAllModelsOption(props.offering.resource_options)}
        orderForm
        secretInputs
      />
    </StepAccordionCard>
  );
};
