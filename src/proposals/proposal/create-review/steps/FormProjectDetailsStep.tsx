import { StepComponentProps } from 'waldur-wizard';

import { ProjectDetailsSummary } from '@/proposals/proposal/create/ProjectDetailsSummary';
import { Proposal, ProposalReview } from '@/proposals/types';

export const FormProjectDetailsStep = (props: StepComponentProps) => {
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
