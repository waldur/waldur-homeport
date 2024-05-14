import { FC } from 'react';
import { Badge, Stack } from 'react-bootstrap';

import { formatDate, formatRelativeWithHour } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { ModelCard1 } from '@waldur/core/ModelCard1';
import { translate } from '@waldur/i18n';

import { PublicCallApplyButton } from './details/PublicCallApplyButton';
import { getRoundStatus, getSortedRoundsWithStatus } from './utils';

export const CallCard: FC<{ call }> = ({ call }) => {
  const getSortedRounds = getSortedRoundsWithStatus(call.rounds);
  const lastRoundStatus = getRoundStatus(getSortedRounds[0]);
  const nextRoundDate = getSortedRounds?.length
    ? getSortedRounds[0].cutoff_time
    : call.end_date;

  return (
    <ModelCard1
      title={call.name}
      subtitle={call.customer_name}
      body={call.description}
      footer={
        <div className="d-flex justify-content-between">
          {!lastRoundStatus ? (
            <div className="text-muted">{translate('No rounds')}</div>
          ) : lastRoundStatus.label === 'Open' ? (
            <Badge bg="warning" text="dark">
              {translate('Cutoff')}
              {': '}
              <strong>{formatRelativeWithHour(nextRoundDate)}</strong>
            </Badge>
          ) : lastRoundStatus.label === 'Ended' ? (
            <div className="text-muted">
              {translate('Cutoff')}
              {': '}
              <strong>{formatDate(nextRoundDate)}</strong>
            </div>
          ) : null}
          <Stack direction="horizontal" gap={4}>
            <PublicCallApplyButton
              call={call}
              title={translate('Apply')}
              variant="flush"
              className="text-btn"
            />
            <Link
              state="public-calls.details"
              params={{ uuid: call.uuid }}
              className="btn btn-flush text-anchor"
              label={translate('View call')}
            />
          </Stack>
        </div>
      }
    />
  );
};
