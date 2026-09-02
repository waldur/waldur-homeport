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
  /** One line about where the request stands, hung under the step it is about.
   *  This component owns the card and picks its own current step, so a caller
   *  cannot attach it: hand the sentence in and it lands on the right one. */
  note?: CurrentStepNote;
}

/**
 * What to say about the step the tracker is sitting on, and — when the step is
 * waiting on the applicant rather than merely running — which status to wear
 * while saying it. `warning` is the design system's own "this needs something
 * from you" step: amber marker, connector and title, supporting text neutral.
 */
export interface CurrentStepNote {
  text: ReactNode;
  variant?: ProgressStep['variant'];
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

export const getSteps = (
  proposal: Proposal,
  note?: CurrentStepNote,
): ProgressStep[] => {
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
    // Everything up to `currentStateIndex` is done, so the step after it is
    // the one in flight — and the one the note is about. A step that already
    // declares its own status is excluded: on a canceled proposal that is the
    // red "Canceled" marker at index 0, and it must not be repainted amber or
    // captioned with a note about a decision that is no longer coming.
    const isCurrent = i === currentStateIndex + 1 && !step.variant;
    return {
      label: step.label,
      completed: i <= currentStateIndex,
      variant: isCurrent
        ? note?.variant
        : (step.variant as ProgressStep['variant']),
      description: isCurrent && note ? [note.text] : undefined,
    };
  });
};

export const ProgressSteps: FC<ProgressStepsProps> = ({
  proposal,
  className,
  bgClass,
  note,
}) => {
  const steps = useMemo(() => getSteps(proposal, note), [proposal, note]);
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
