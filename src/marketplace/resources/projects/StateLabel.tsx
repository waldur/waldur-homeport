import { FC } from 'react';
import { Badge as BsBadge, Spinner } from 'react-bootstrap';

import { translate } from '@/i18n';

// In-flight states that warrant an inline spinner alongside the badge,
// so users can see at-a-glance which RPs are still being reconciled by
// the site-agent + downstream operator.
const PROGRESSING_STATES = new Set(['Creating', 'Updating', 'Terminating']);

export const StateLabel: FC<{ state: string }> = ({ state }) => {
  const variant =
    {
      Creating: 'info',
      OK: 'success',
      Erred: 'danger',
      Updating: 'warning',
      Terminating: 'warning',
      Terminated: 'secondary',
    }[state] || 'secondary';

  return (
    <span className="d-inline-flex align-items-center gap-1">
      <BsBadge bg={variant}>{state}</BsBadge>
      {PROGRESSING_STATES.has(state) && (
        <Spinner
          animation="border"
          size="sm"
          role="status"
          aria-label={translate('In progress')}
        />
      )}
    </span>
  );
};
