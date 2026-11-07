import { LockIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, MouseEvent, useCallback } from 'react';

import { Badge } from 'waldur-ui';

import { formatDate, formatRelativeWithHour } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { ModelCard1 } from '@/core/ModelCard1';
import { translate } from '@/i18n';

import { PublicCallApplyButton } from './details/PublicCallApplyButton';
import { continuouslyOpenLabel, isOpenEnded } from './roundCutoff';
import { Call } from './types';
import { getCallStatus, getRoundsWithStatus } from './utils';

const CallLink = ({ call, asButton = false, children }) => (
  <Link
    state="public-call.details"
    params={{ call_uuid: call.uuid }}
    buttonVariant={asButton ? 'text-primary' : undefined}
    buttonSize={asButton ? 'sm' : undefined}
  >
    {children}
  </Link>
);

const stopPropagation = (e: MouseEvent) => e.stopPropagation();

export const CallCard: FC<{ call: Call }> = ({ call }) => {
  const nextRound = getRoundsWithStatus(call.rounds)[0];
  const status = getCallStatus(call);
  const router = useRouter();
  // The card navigates via onClick instead of wrapping everything in an
  // anchor: the footer holds its own links, and nesting <a> inside <a> is
  // invalid DOM (same pattern as ProjectCard).
  const openCall = useCallback(
    () =>
      router.stateService.go('public-call.details', { call_uuid: call.uuid }),
    [router, call.uuid],
  );

  return (
    <ModelCard1
      title={call.name}
      subtitle={call.customer_name}
      body={call.description}
      clickable
      onClick={openCall}
      footer={
        <div className="flex justify-between items-center">
          <div className="flex items-center self-stretch gap-1">
            {/* An archived call keeps its rounds for the record; their
                dates would read as an open call. */}
            {call.state === 'archived' ? (
              <Badge variant={status.color} shape="pill" tone="outline">
                {status.label}
              </Badge>
            ) : !nextRound ? (
              <div className="text-quaternary">{translate('No rounds')}</div>
            ) : nextRound.status.value === 'open' && isOpenEnded(nextRound) ? (
              <Badge variant="success" shape="pill" tone="outline">
                {continuouslyOpenLabel()}
              </Badge>
            ) : nextRound.status.label === 'Open' ? (
              <Badge variant="warning" shape="pill" tone="outline">
                {translate('Cutoff')}
                {': '}
                {formatRelativeWithHour(nextRound.cutoff_time)}
              </Badge>
            ) : nextRound.status.label === 'Ended' ? (
              <div className="text-quaternary">
                {translate('Cutoff')}
                {': '}
                <strong>{formatDate(nextRound.cutoff_time)}</strong>
              </div>
            ) : null}
            {Boolean(call.fixed_duration_in_days) && (
              <Badge
                variant="neutral"
                shape="pill"
                tone="outline"
                tooltip={
                  <Badge
                    variant="blue"
                    leftIcon={<LockIcon weight="bold" />}
                    shape="pill"
                    tone="outline"
                  >
                    {translate('Fixed duration: {n} days', {
                      n: call.fixed_duration_in_days,
                    })}
                  </Badge>
                }
                tooltipProps={{ theme: 'light', autoWidth: true }}
                className="px-1.5"
              >
                +1
              </Badge>
            )}
          </div>
          {/* The apply button opens a dialog: its clicks stay out of the card's. */}
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div onClick={stopPropagation}>
            <div className="flex items-center self-stretch gap-1.5">
              <PublicCallApplyButton
                call={call}
                title={translate('Apply to call')}
                variant="text-primary"
                size="sm"
              />

              <CallLink call={call} asButton>
                {translate('Details')}
              </CallLink>
            </div>
          </div>
        </div>
      }
    />
  );
};
