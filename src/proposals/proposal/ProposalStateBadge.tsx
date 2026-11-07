import { FC } from 'react';
import {
  ProposalChangeRequest,
  ProposalStates,
  ProposalStatusLabel,
} from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

import { HeldDecisionBadge } from '../manage/HeldDecisionBadge';

import { ProposalBadge } from './ProposalBadge';

/**
 * A proposal's state in a list. A decision held for the round's publication
 * shows its tentative outcome instead; `decision_held` is null for everyone
 * outside the call team, who keep seeing the proposal in review. A proposal
 * sent back to its applicant reads "Changes requested" to those who are told
 * of it (`open_change_requests` is empty for everyone else). The labels the
 * call gives the steps of the current stage (`status_labels`) are the
 * expanded row's ("Current stage"), or text under the badge with
 * `withLabels`: a call may word them at length.
 */
export const ProposalStateBadge: FC<{
  row: {
    uuid: string;
    state: ProposalStates;
    decision_held?: boolean | null;
    open_change_requests?: ProposalChangeRequest[];
    status_labels?: ProposalStatusLabel[];
  };
  /**
   * Show the step labels under the badge. Lists leave them to the expanded
   * row ("Current stage"): a call may word them at length.
   */
  withLabels?: boolean;
}> = ({ row, withLabels }) =>
  row.decision_held === true ? (
    <HeldDecisionBadge proposalUuid={row.uuid} />
  ) : withLabels && row.status_labels?.length ? (
    <div className="flex flex-col items-start gap-1">
      <ProposalBadge state={row.state} />
      {row.status_labels.map((entry) => (
        <span
          key={entry.step}
          className="text-quaternary text-xs whitespace-normal"
        >
          {entry.label}
        </span>
      ))}
    </div>
  ) : row.state === 'in_review' && row.open_change_requests?.length ? (
    <Badge variant="warning" shape="pill" tone="outline">
      {translate('Changes requested')}
    </Badge>
  ) : (
    <ProposalBadge state={row.state} />
  );
