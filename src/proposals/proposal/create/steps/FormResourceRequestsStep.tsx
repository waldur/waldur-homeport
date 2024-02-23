import { ProposalFormStepProps } from '@waldur/proposals/types';

import { StepCard } from './StepCard';

export const FormResourceRequestsStep = (props: ProposalFormStepProps) => {
  return (
    <StepCard
      title={props.title}
      step={props.step}
      id={props.id}
      completed={props.observed}
    >
      Resource requests fields
    </StepCard>
  );
};
