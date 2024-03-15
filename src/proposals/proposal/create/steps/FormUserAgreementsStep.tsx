import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { ProposalFormStepProps } from '@waldur/proposals/types';

export const FormUserAgreementsStep = (props: ProposalFormStepProps) => {
  return (
    <StepCard
      title={props.title}
      step={props.step}
      id={props.id}
      completed={props.observed}
    >
      User agreements fields
    </StepCard>
  );
};
