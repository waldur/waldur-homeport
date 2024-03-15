import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { ProposalFormStepProps } from '@waldur/proposals/types';

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
