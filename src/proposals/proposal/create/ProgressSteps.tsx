import { XIcon } from '@phosphor-icons/react';
import { FC, ReactNode, useMemo } from 'react';

import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { Proposal } from '@/proposals/types';
import { ProgressStep, ProgressSteps as MainProgressSteps } from '@/wizard';

interface ProgressStepsProps {
  proposal: Proposal;
  bgClass?: string;
  className?: string;
  /** Rendered inside the panel, under the stepper. This component owns the
   *  card, so a caller that appended its own note would leave it stranded on
   *  the page background below the tracker rather than reading as part of it. */
  footer?: ReactNode;
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

export const getSteps = (proposal: Proposal): ProgressStep[] => {
  const sortedSteps = getSortedSteps(proposal);
  const currentStateIndex =
    sortedSteps.findIndex((step) => step.state.includes(proposal.state)) - 1;
  return sortedSteps.map((step, i) => {
    // A rejected proposal has reached the Decision step but failed there.
    // Render that step as a solid red marker with an ✕ — mirroring the
    // detailed WorkflowTimeline — so the tracker agrees with the red
    // "Rejected" badge instead of showing an all-green, success-looking step.
    if (proposal.state === 'rejected' && step.state.includes('rejected')) {
      return {
        label: step.label,
        completed: true,
        variant: 'danger',
        labelClass: 'text-danger',
        icon: <XIcon size={16} weight="bold" />,
      };
    }
    return {
      label: step.label,
      completed: i <= currentStateIndex,
      variant: step.variant as ProgressStep['variant'],
    };
  });
};

export const ProgressSteps: FC<ProgressStepsProps> = ({
  proposal,
  className,
  bgClass,
  footer,
}) => {
  const steps = useMemo(() => getSteps(proposal), [proposal]);
  return (
    <Panel cardBordered className="overflow-hidden">
      <MainProgressSteps
        steps={steps}
        bgClass={bgClass}
        className={className}
      />
      {footer}
    </Panel>
  );
};
