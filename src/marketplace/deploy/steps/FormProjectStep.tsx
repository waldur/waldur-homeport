import { translate } from '@waldur/i18n';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';

import { FormStepProps } from '../types';

import { StepCard } from './StepCard';

export const FormProjectStep = (props: FormStepProps) => {
  return (
    <StepCard
      title={translate('Project')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
    >
      <ProjectField />
    </StepCard>
  );
};
