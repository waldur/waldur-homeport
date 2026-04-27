import { VStepperFormStepProps } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { TeamSection } from '@/proposals/team/TeamSection';
import { Proposal, ProposalReview } from '@/proposals/types';

export const ReviewTeamStep = (props: VStepperFormStepProps) => {
  const proposal: Proposal = props.params.proposal;
  const onAddCommentClick = props.params?.onAddCommentClick;
  const reviews: ProposalReview[] = props.params?.reviews;
  const readOnlyMode = props.params?.readOnly;

  return (
    <TeamSection
      id={props.id}
      scope={proposal}
      roleTypes={['proposal']}
      title={translate('Project team')}
      reviews={reviews}
      onAddCommentClick={onAddCommentClick}
      readOnlyMode={readOnlyMode}
    />
  );
};
