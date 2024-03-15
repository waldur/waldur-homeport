import { translate } from '@waldur/i18n';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';

import { FormStepProps } from '../types';

export const FormProjectStep = (props: FormStepProps) => {
  return (
    <StepCard
      title={translate('Project')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
      required={props.required}
    >
      <ProjectField hideLabel />
    </StepCard>
  );
};
