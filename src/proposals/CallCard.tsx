import { FC } from 'react';
import { Stack } from 'react-bootstrap';

import { Badge } from '@waldur/core/Badge';
import { formatDate, formatRelativeWithHour } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { ModelCard1 } from '@waldur/core/ModelCard1';
import { translate } from '@waldur/i18n';

import { PublicCallApplyButton } from './details/PublicCallApplyButton';
import { getRoundsWithStatus } from './utils';

export const CallCard: FC<{ call }> = ({ call }) => {
  const nextRound = getRoundsWithStatus(call.rounds)[0];

  return (
    <ModelCard1
      title={call.name}
      subtitle={call.customer_name}
      body={call.description}
      footer={
        <div className="d-flex justify-content-between align-items-center">
          {!nextRound ? (
            <div className="text-muted">{translate('No rounds')}</div>
          ) : nextRound.status.label === 'Open' ? (
            <Badge variant="warning" outline pill>
              {translate('Cutoff')}
              {': '}
              {formatRelativeWithHour(nextRound.cutoff_time)}
            </Badge>
          ) : nextRound.status.label === 'Ended' ? (
            <div className="text-muted">
              {translate('Cutoff')}
              {': '}
              <strong>{formatDate(nextRound.cutoff_time)}</strong>
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
              state="public-call.details"
              params={{ call_uuid: call.uuid }}
              className="btn btn-flush text-anchor"
              label={translate('View call')}
            />
          </Stack>
        </div>
      }
    />
  );
};
