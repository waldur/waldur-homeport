import { FC } from 'react';

import { translate } from '@/i18n';

import { usesCallVocabulary } from './presentation';
import {
  formatPrepaidMonthsCap,
  formatProjectDuration,
  resolvePrepaidMonthsCap,
} from './projectDuration';

/**
 * What a call's duration setting means for an applicant, stated once so the
 * call page, the offering rows and the request form agree: a fixed duration
 * is the length of every project the call awards *and* the ceiling for any
 * prepaid subscription requested under it; without one, the longest
 * subscription requested decides.
 */
export const CallDurationPolicy: FC<{
  call: {
    fixed_duration_in_days?: number | null;
    max_prepaid_duration_months?: number | null;
  };
}> = ({ call }) => {
  const days = call.fixed_duration_in_days;
  if (!days) {
    return (
      <>
        {usesCallVocabulary()
          ? translate(
              'Not fixed: each project lasts as long as the longest subscription it requests.',
            )
          : translate(
              'Not fixed: access lasts as long as the longest subscription requested.',
            )}
      </>
    );
  }
  const cap = resolvePrepaidMonthsCap(call);
  return (
    <>
      <span className="fw-semibold">{formatProjectDuration({ days })}</span>
      <span className="text-muted ms-2">
        {cap
          ? translate('Prepaid subscriptions {cap}.', {
              cap: formatPrepaidMonthsCap(cap),
            })
          : translate('Too short for a prepaid subscription.')}
      </span>
    </>
  );
};

/** Column/row form: "up to 2 months" or nothing when the call fixes no length. */
export const prepaidCapLabel = (call: {
  fixed_duration_in_days?: number | null;
  max_prepaid_duration_months?: number | null;
}): string | undefined => {
  const cap = resolvePrepaidMonthsCap(call);
  if (cap === null) {
    return undefined;
  }
  return cap
    ? formatPrepaidMonthsCap(cap)
    : translate('too short for a prepaid subscription');
};
