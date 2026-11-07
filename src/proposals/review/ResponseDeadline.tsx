import { FC } from 'react';

import { Badge } from 'waldur-ui';

import { formatDateTime, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';

/** Under this much time left, a pending response is highlighted. */
const URGENT_WINDOW_MS = 48 * 60 * 60 * 1000;

const isDeadlineUrgent = (expiresAt: string, now = Date.now()) => {
  const left = new Date(expiresAt).getTime() - now;
  return left > 0 && left < URGENT_WINDOW_MS;
};

/**
 * Shown in place of Accept and Decline once the response window has closed:
 * the actions would only be refused, so they are not offered at all.
 */
export const ExpiredResponseNotice: FC<{ expiresAt?: string | null }> = ({
  expiresAt,
}) => (
  <span className="text-quaternary small" data-testid="expired-response-notice">
    {expiresAt
      ? translate('Expired on {date}. Ask the call manager to send it again.', {
          date: formatDateTime(expiresAt),
        })
      : translate('Expired. Ask the call manager to send it again.')}
  </span>
);

/** Time left to respond, highlighted when less than 48 hours remain. */
export const ResponseTimeLeft: FC<{ expiresAt?: string | null }> = ({
  expiresAt,
}) => {
  if (!expiresAt) {
    return null;
  }
  const label = translate('Expires {time}', {
    time: formatRelative(expiresAt),
  });
  if (isDeadlineUrgent(expiresAt)) {
    return (
      <Badge
        variant="warning"
        size="sm"
        shape="pill"
        tone="outline"
        data-testid="response-time-left-urgent"
      >
        {label}
      </Badge>
    );
  }
  return (
    <span className="text-quaternary small" data-testid="response-time-left">
      {label}
    </span>
  );
};
