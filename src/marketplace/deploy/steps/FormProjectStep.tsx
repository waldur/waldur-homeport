import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';

import { FormStepProps } from '../types';

export const FormProjectStep = (props: FormStepProps) => {
  return (
    <VStepperFormStepCard
      title={translate('Project')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
      required={props.required}
    >
      <ProjectField hideLabel />
    </VStepperFormStepCard>
  );
};
