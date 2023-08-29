import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { getProject } from '@waldur/workspace/selectors';

import { FormStepProps } from '../types';

import { StepCard } from './StepCard';

export const FormProjectStep = (props: FormStepProps) => {
  const project = useSelector(getProject);
  useEffect(() => {
    if (project) {
      props.change('project', project);
    }
  }, [project]);

  return (
    <StepCard
      title={translate('Project')}
      step={props.step}
      id={props.id}
      completed={props.observed}
    >
      <ProjectField />
    </StepCard>
  );
};
