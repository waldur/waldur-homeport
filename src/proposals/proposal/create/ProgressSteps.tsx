import { FC, useMemo } from 'react';

import { Panel } from '@/core/Panel';
import { ProgressSteps as MainProgressSteps } from '@/core/ProgressSteps';
import { translate } from '@/i18n';
import { Proposal } from '@/proposals/types';

interface ProgressStepsProps {
  proposal: Proposal;
  bgClass?: string;
  className?: string;
}

const getSortedSteps = (proposal: Proposal) => [
  proposal.state === 'canceled'
    ? {
        label: translate('Canceled'),
        state: ['canceled'],
        variant: 'danger',
      }
    : {
        label: translate('Submission'),
        state: ['draft'],
      },
  {
    label: translate('Review'),
    state: ['in_review', 'submitted'],
  },
  {
    label: translate('Decision'),
    state: ['accepted', 'rejected'],
  },
];

const getSteps = (proposal: Proposal) => {
  const steps: Array<{ label; description?; completed; variant? }> = [];
  const sortedSteps = getSortedSteps(proposal);
  const currentStateIndex =
    sortedSteps.findIndex((step) => step.state.includes(proposal.state)) - 1;
  sortedSteps.forEach((step, i) => {
    steps.push({
      label: step.label,
      completed: i <= currentStateIndex,
      variant: step.variant,
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
    <Panel cardBordered className="overflow-hidden">
      <MainProgressSteps
        steps={steps}
        bgClass={bgClass}
        className={className}
      />
    </Panel>
  );
};
