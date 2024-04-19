import { Button } from 'react-bootstrap';

import {
  VStepperFormStepCard,
  VStepperFormStepProps,
} from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { ProjectDetailsSummary } from '@waldur/proposals/proposal/create/ProjectDetailsSummary';
import { Proposal, ProposalReview } from '@waldur/proposals/types';

export const FormProjectDetailsStep = (props: VStepperFormStepProps) => {
  const proposal: Proposal = props.params?.proposal;
  const reviews: ProposalReview[] = props.params?.reviews;
  const onAddCommentClick = props.params?.onAddCommentClick;

  return (
    <VStepperFormStepCard
      title={props.title}
      step={props.step}
      id={props.id}
      completed={props.observed}
    >
      <ProjectDetailsSummary
        proposal={proposal}
        reviews={reviews}
        onAddCommentClick={onAddCommentClick}
        hideHeader
        paddingless
      />

      <Button
        type="button"
        variant="primary"
        size="lg"
        className="mt-10 w-25 min-w-200px"
      >
        {translate('Next section')}
      </Button>
    </VStepperFormStepCard>
  );
};
