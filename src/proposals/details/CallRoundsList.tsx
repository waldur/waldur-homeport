import { useMemo } from 'react';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { ProposalCall } from '../types';
import { getSortedRoundsWithStatus } from '../utils';

interface CallRoundsListProps {
  call: ProposalCall;
  max?: number;
  filterCode?: number;
}

export const CallRoundsList = ({
  call,
  max,
  filterCode,
}: CallRoundsListProps) => {
  let rounds = useMemo(() => {
    const items = getSortedRoundsWithStatus(call.rounds);
    return max ? items.slice(0, max) : items;
  }, [call, max]);
  if (filterCode) {
    rounds = rounds.filter((round) => round.state.code !== filterCode);
  }
  return rounds?.length ? (
    <ul className="list-unstyled">
      {rounds.map((round) => (
        <li
          key={round.uuid}
          className={
            'd-flex justify-content-between mb-3' +
            (round.state.code === 0 ? ' fw-bold' : '')
          }
        >
          <span>
            {formatDate(round.start_time)} - {formatDate(round.cutoff_time)}
          </span>
          <span className={round.state.code === -1 ? 'text-muted' : ''}>
            {round.state.label}
          </span>
        </li>
      ))}
    </ul>
  ) : (
    <h4 className="text-muted text-center py-4">{translate('No rounds')}</h4>
  );
};
