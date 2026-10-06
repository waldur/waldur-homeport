import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { Badge } from 'waldur-ui';

import {
  HELD_DECISION_STEP,
  heldDecisionLabel,
  heldDecisionVariant,
} from '../roundLifecycle';
import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from '../workflow/queries';

/**
 * A decision made but held until its round publishes results, as the call
 * team sees it. The proposal itself stays in review; the outcome is recorded
 * on the allocation decision step, which the backend reveals only to the
 * call's managers, staff and support — the same people who get a non-null
 * `decision_held`, so this is never rendered for an applicant or reviewer.
 */
export const HeldDecisionBadge: FC<{ proposalUuid: string }> = ({
  proposalUuid,
}) => {
  // The list carries no outcome, so each held row reads its proposal's
  // workflow; the key is the proposal page's own, so the two share a fetch.
  const { data, isLoading } = useQuery({
    queryKey: proposalWorkflowStatesKey(proposalUuid),
    queryFn: () => fetchProposalWorkflowStates(proposalUuid),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
  if (isLoading) {
    // A placeholder rather than "Decision held", which would flip to the
    // tentative outcome a moment later.
    return (
      <span
        className="placeholder-glow d-inline-block"
        aria-busy="true"
        data-testid="held-decision-badge-loading"
      >
        <span className="placeholder rounded-pill" style={{ width: '7rem' }} />
      </span>
    );
  }
  const outcome = (data ?? []).find(
    (s) => s.step === HELD_DECISION_STEP,
  )?.outcome;
  return (
    <Badge
      variant={heldDecisionVariant(outcome)}
      shape="pill"
      tone="light"
      data-testid="held-decision-badge"
    >
      {heldDecisionLabel(outcome)}
    </Badge>
  );
};
