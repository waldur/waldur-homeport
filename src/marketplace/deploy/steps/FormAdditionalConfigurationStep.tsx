import classNames from 'classnames';

import { AccordionCard } from '@/core/AccordionCard';
import { OptionsForm } from '@/marketplace/common/OptionsForm';
import { StepContent } from '@/wizard/VStepperFormStep';

import { useOrderFormData } from '../selectors';
import { FormStepProps } from '../types';

export const FormAdditionalConfigurationStep = (props: FormStepProps) => {
  const { customer } = useOrderFormData();

  return (
    <AccordionCard
      title={props.title}
      id={props.id}
      className={classNames('step-card', props.disabled && 'step-disabled')}
      defaultOpen
    >
      <StepContent
        disabled={props.disabled}
        disabledReason={props.disabledTooltip}
      >
        <OptionsForm options={props.offering.options} customer={customer} />
      </StepContent>
    </AccordionCard>
  );
};
