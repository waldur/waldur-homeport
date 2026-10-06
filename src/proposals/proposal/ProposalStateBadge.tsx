import { FC } from 'react';
import { ProposalStates } from 'waldur-js-client';

import { HeldDecisionBadge } from '../manage/HeldDecisionBadge';

import { ProposalBadge } from './ProposalBadge';

/**
 * A proposal's state in a list. A decision held for the round's publication
 * shows its tentative outcome instead; `decision_held` is null for everyone
 * outside the call team, who keep seeing the proposal in review.
 */
export const ProposalStateBadge: FC<{
  row: {
    uuid: string;
    state: ProposalStates;
    decision_held?: boolean | null;
  };
}> = ({ row }) =>
  row.decision_held === true ? (
    <HeldDecisionBadge proposalUuid={row.uuid} />
  ) : (
    <ProposalBadge state={row.state} />
  );
