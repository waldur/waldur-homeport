import { Button } from 'react-bootstrap';

import {
  VStepperFormStepCard,
  VStepperFormStepProps,
} from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { ProjectDetailsSummary } from '@waldur/proposals/proposal/create/ProjectDetailsSummary';
import { Proposal } from '@waldur/proposals/types';

export const FormProjectDetailsStep = (props: VStepperFormStepProps) => {
  const proposal: Proposal = props.params?.proposal;

  return (
    <VStepperFormStepCard
      title={props.title}
      step={props.step}
      id={props.id}
      completed={props.observed}
    >
      <ProjectDetailsSummary
        proposal={proposal}
        commentable
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
