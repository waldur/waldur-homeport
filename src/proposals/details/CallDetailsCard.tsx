import { useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

import { CallStateField } from '../CallStateField';
import { ProposalCall } from '../types';
import { getSortedRoundsWithStatus } from '../utils';

interface CallDetailsCardProps {
  call: ProposalCall;
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
        <Field
          label={translate('Opening date')}
          value={renderFieldOrDash(formatDateTime(call.created))}
        />
        <Field
          label={translate('Round deadlines')}
          value={
            call.rounds?.length
              ? call.rounds
                  .map((round) => formatDateTime(round.cutoff_time))
                  .join(' / ')
              : renderFieldOrDash(formatDateTime(call.end_time))
          }
        />
        <Field
          label={translate('Review strategy in active round')}
          value={activeRound?.review_strategy}
        />
        <Field
          label={translate('Round strategy in active round')}
          value={activeRound?.deciding_entity}
        />
        <Field
          label={translate('Allocation strategy in active round')}
          value={activeRound?.allocation_time}
        />
      </Card.Body>
    </Card>
  );
};
