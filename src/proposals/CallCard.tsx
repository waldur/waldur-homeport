import { LockIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Stack } from 'react-bootstrap';

import { Badge } from '@/core/Badge';
import { formatDate, formatRelativeWithHour } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { ModelCard1 } from '@/core/ModelCard1';
import { translate } from '@/i18n';

import { PublicCallApplyButton } from './details/PublicCallApplyButton';
import { Call } from './types';
import { getRoundsWithStatus } from './utils';

const CallLink = ({ call, asButton = false, children }) => (
  <Link
    state="public-call.details"
    params={{ call_uuid: call.uuid }}
    buttonVariant={asButton ? 'text-primary' : undefined}
    className={asButton ? 'btn-sm' : undefined}
  >
    {children}
  </Link>
);

export const CallCard: FC<{ call: Call }> = ({ call }) => {
  const nextRound = getRoundsWithStatus(call.rounds)[0];

  return (
    <CallLink call={call}>
      <ModelCard1
        title={call.name}
        subtitle={call.customer_name}
        body={call.description}
        clickable
        footer={
          <div className="d-flex justify-content-between align-items-center">
            <Stack direction="horizontal" gap={1}>
              {!nextRound ? (
                <div className="text-muted">{translate('No rounds')}</div>
              ) : nextRound.status.label === 'Open' ? (
                <Badge variant="warning" pill outline>
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
              {Boolean(call.fixed_duration_in_days) && (
                <Badge
                  variant="default"
                  pill
                  outline
                  tooltip={
                    <Badge
                      variant="blue"
                      leftIcon={<LockIcon weight="bold" />}
                      pill
                      outline
                    >
                      {translate('Fixed duration: {n} days', {
                        n: call.fixed_duration_in_days,
                      })}
                    </Badge>
                  }
                  tooltipProps={{ theme: 'light', autoWidth: true }}
                  className="px-2"
                >
                  +1
                </Badge>
              )}
            </Stack>
            <Stack direction="horizontal" gap={2}>
              <PublicCallApplyButton
                call={call}
                title={translate('Apply')}
                variant="text-primary"
                size="sm"
              />

              <CallLink call={call} asButton>
                {translate('Details')}
              </CallLink>
            </Stack>
          </div>
        }
      />
    </CallLink>
  );
};
