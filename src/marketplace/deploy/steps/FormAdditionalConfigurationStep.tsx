import { OptionsForm } from '@waldur/marketplace/common/OptionsForm';

import { FormStepProps } from '../types';

import { StepCard } from './StepCard';

export const FormAdditionalConfigurationStep = (props: FormStepProps) => (
  <StepCard
    title={props.title}
    step={props.step}
    id={props.id}
    completed={props.observed}
    disabled={props.disabled}
  >
    <OptionsForm options={props.offering.options} />
  </StepCard>
);
