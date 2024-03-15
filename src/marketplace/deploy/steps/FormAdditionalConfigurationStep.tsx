import { OptionsForm } from '@waldur/marketplace/common/OptionsForm';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';

import { FormStepProps } from '../types';

export const FormAdditionalConfigurationStep = (props: FormStepProps) => (
  <StepCard
    title={props.title}
    step={props.step}
    id={props.id}
    completed={props.observed}
    disabled={props.disabled}
    required={props.required}
  >
    <OptionsForm options={props.offering.options} />
  </StepCard>
);
