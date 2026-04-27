import { VStepperFormStepProps } from '@/form/VStepperFormStep';
import { ProjectDetailsSummary } from '@/proposals/proposal/create/ProjectDetailsSummary';
import { Proposal, ProposalReview } from '@/proposals/types';

export const FormProjectDetailsStep = (props: VStepperFormStepProps) => {
  const proposal: Proposal = props.params?.proposal;
  const reviews: ProposalReview[] = props.params?.reviews;
  const onAddCommentClick = props.params?.onAddCommentClick;

  return (
    <ProjectDetailsSummary
      proposal={proposal}
      reviews={reviews}
      onAddCommentClick={onAddCommentClick}
    />
  );
};
