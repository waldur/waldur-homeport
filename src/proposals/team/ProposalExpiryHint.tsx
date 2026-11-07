import { DateTime } from 'luxon';
import { FC } from 'react';
import { useFormState } from 'react-final-form';

import { AlertItem } from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import {
  formatProjectDuration,
  ProjectDuration,
} from '@/proposals/projectDuration';
import { useProjectDuration } from '@/proposals/ProjectDurationNote';

/** Counted from today, so a lower bound: allocation starts the clock later. */
export const earliestProjectEnd = (
  duration: ProjectDuration,
  from: DateTime = DateTime.now(),
): DateTime | null => {
  if (!duration) {
    return null;
  }
  const start = from.startOf('day');
  return 'days' in duration
    ? start.plus({ days: duration.days })
    : start.plus({ months: duration.months });
};

/**
 * The backend only refuses a past date, and an expiry bites only while the
 * proposal is a draft: submitted teams keep their roles and the awarded
 * project is set up without one. So this explains rather than blocks.
 */
export const ProposalExpiryHint: FC<{
  proposal: {
    uuid: string;
    call_uuid?: string;
    requested_duration_months?: number | null;
  };
}> = ({ proposal }) => {
  const duration = useProjectDuration(proposal);
  const {
    values: { expiration_time },
  } = useFormState({ subscription: { values: true } });
  const end = earliestProjectEnd(duration);
  if (!end) {
    return null;
  }
  const expiry = expiration_time ? DateTime.fromISO(expiration_time) : null;
  const endsEarly = expiry?.isValid && expiry.startOf('day') < end;
  return (
    <div className="mt-1.5" data-testid="proposal-expiry-hint">
      <p className="text-quaternary text-sm mb-0">
        {translate('The project is expected to run for at least {duration}.', {
          duration: formatProjectDuration(duration),
        })}
      </p>
      {endsEarly && (
        <AlertItem
          variant="warning"
          type="floating"
          className="mt-2.5"
          title={translate('The role ends before the project would')}
          body={translate(
            'While the proposal is a draft, the role is revoked on {date} and the member drops out of the team. Once the proposal is submitted, team roles no longer expire.',
            { date: formatDate(expiration_time) },
          )}
        />
      )}
    </div>
  );
};
