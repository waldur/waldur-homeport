import { Card } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

import { CallStateField } from '../CallStateField';
import { ProposalCall } from '../types';

interface CallDetailsCardProps {
  call: ProposalCall;
}

export const CallDetailsCard = ({ call }: CallDetailsCardProps) => {
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
          label={translate('Deadline')}
          value={
            call.rounds?.length
              ? call.rounds
                  .map((round) => formatDateTime(round.cutoff_time))
                  .join(' / ')
              : renderFieldOrDash(formatDateTime(call.end_time))
          }
        />
        <Field
          label={translate('Review strategy')}
          value={call.review_strategy}
        />
        <Field
          label={translate('Round strategy')}
          value={call.round_strategy}
        />
        <Field
          label={translate('Allocation strategy')}
          value={call.allocation_strategy}
        />
      </Card.Body>
    </Card>
  );
};
