import { ProposalFormStepProps } from '@waldur/proposals/types';

import { StepCard } from './StepCard';

export const FormTeamStep = (props: ProposalFormStepProps) => {
  return (
    <StepCard
      title={props.title}
      step={props.step}
      id={props.id}
      completed={props.observed}
    >
      Team fields
    </StepCard>
  );
};
