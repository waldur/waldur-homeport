import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { OptionsForm } from '@waldur/marketplace/common/OptionsForm';

import { FormStepProps } from '../types';

export const FormAdditionalConfigurationStep = (props: FormStepProps) => (
  <VStepperFormStepCard
    title={props.title}
    step={props.step}
    id={props.id}
    completed={props.observed}
    disabled={props.disabled}
    required={props.required}
  >
    <OptionsForm options={props.offering.options} />
  </VStepperFormStepCard>
);
