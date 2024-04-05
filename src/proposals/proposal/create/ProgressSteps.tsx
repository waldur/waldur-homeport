import { FC, useMemo } from 'react';

import { ProgressSteps as MainProgressSteps } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';
import { Proposal } from '@waldur/proposals/types';

interface ProgressStepsProps {
  proposal: Proposal;
  bgClass?: string;
  className?: string;
}

const sortedSteps = [
  {
    label: translate('Submission'),
    state: ['draft'],
  },
  {
    label: translate('Verify team'),
    state: ['team_verification'],
  },
  {
    label: translate('Review'),
    state: ['in_review', 'submitted'],
  },
  {
    label: translate('Updates'),
    state: ['in_revision'],
  },
  {
    label: translate('Accepted'),
    state: ['accepted'],
  },
];

const getSteps = (proposal: Proposal) => {
  const steps: Array<{ label; description?; completed; color? }> = [];
  const currentStateIndex =
    sortedSteps.findIndex((step) => step.state.includes(proposal.state)) - 1;
  sortedSteps.forEach((step, i) => {
    steps.push({
      label: step.label,
      completed: i <= currentStateIndex,
    });
  });
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
