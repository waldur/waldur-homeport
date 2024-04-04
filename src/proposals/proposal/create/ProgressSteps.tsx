import { FC, useMemo } from 'react';

import { ProgressSteps as MainProgressSteps } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';
import { Proposal } from '@waldur/proposals/types';

interface ProgressStepsProps {
  proposal: Proposal;
  bgClass?: string;
  className?: string;
}

const getSteps = (proposal: Proposal) => {
  const steps: Array<{ label; description?; completed; color? }> = [];
  steps.push({
    label: translate('Submission'),
    completed: proposal.state === 'team_verification',
  });
  steps.push(
    {
      label: translate('Verify team'),
      completed: proposal.state === 'in_review',
    },
    {
      label: translate('Review'),
      completed: proposal.state === 'in_revision',
    },
    {
      label: translate('Updates'),
      completed: proposal.state === 'in_revision',
    },
    {
      label: translate('Accepted'),
      completed: proposal.state === 'accepted',
    },
  );
  return steps;
};

export const ProgressSteps: FC<ProgressStepsProps> = ({
  proposal,
  className,
  bgClass,
}) => {
  const steps = useMemo(() => getSteps(proposal), [proposal]);
  return (
    <MainProgressSteps steps={steps} bgClass={bgClass} className={className} />
  );
};
