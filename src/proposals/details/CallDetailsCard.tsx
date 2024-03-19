import { useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

import { CallStateField } from '../CallStateField';
import { Call } from '../types';
import {
  formatRoundAllocationStrategy,
  formatRoundAllocationTime,
  formatRoundReviewStrategy,
  getSortedRoundsWithStatus,
} from '../utils';

interface CallDetailsCardProps {
  call: Call;
}

export const CallDetailsCard = ({ call }: CallDetailsCardProps) => {
  const activeRound = useMemo(() => {
    const items = getSortedRoundsWithStatus(call.rounds);
    const first = items[0];
    if (first && [0, 1].includes(first.state.code)) {
      return first;
    }
    return null;
  }, [call]);

  return (
    <Card id="details" className="mb-7">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Details')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Field
          label={translate('Status')}
          value={<CallStateField call={call} />}
        />
        <Field label={translate('Reference')} value="-" />
        <Field
          label={translate('Publication date')}
          value={renderFieldOrDash(formatDateTime(call.start_time))}
        />
        {activeRound && (
          <Field
            label={translate('Review strategy in active round')}
            value={formatRoundReviewStrategy(activeRound.review_strategy)}
          />
        )}
        {activeRound && (
          <Field
            label={translate('Round strategy in active round')}
            value={formatRoundAllocationStrategy(activeRound.deciding_entity)}
          />
        )}
        {activeRound && (
          <Field
            label={translate('Allocation strategy in active round')}
            value={formatRoundAllocationTime(activeRound.allocation_time)}
          />
        )}
      </Card.Body>
    </Card>
  );
};
