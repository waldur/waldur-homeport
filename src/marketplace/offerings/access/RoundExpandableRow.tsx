import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { SubmittableRound } from '@/marketplace/offerings/apply/eligibleCalls';

/** One label/value line, omitted entirely when there is no value to show. */
const Line: FC<{ label: string; value?: string | null }> = ({
  label,
  value,
}) =>
  value ? (
    <div className="d-flex gap-2">
      <span className="text-muted" style={{ minWidth: 160 }}>
        {label}
      </span>
      <span>{value}</span>
    </div>
  ) : null;

/**
 * What an applicant needs to choose between rounds.
 *
 * The row itself carries the deadline, which is when they must act. This adds
 * the things that decide whether the deadline is worth meeting: who runs the
 * call, when a decision lands, how long the award then runs, and whether they
 * are eligible at all.
 *
 * Fields that vary per deployment are simply omitted when unset rather than
 * rendered empty — a call that publishes no allocation date should not show a
 * dash where a date belongs.
 */
export const RoundExpandableRow: FC<{ row: SubmittableRound }> = ({ row }) => {
  const { call, round } = row;
  const decision = round.allocation_date
    ? formatDate(round.allocation_date)
    : round.review_duration_in_days
      ? translate('About {count} days after the deadline', {
          count: round.review_duration_in_days,
        })
      : undefined;

  return (
    <div className="d-flex flex-column gap-2 p-4 fs-7">
      {/* Who is behind the deadline. The row itself only names the call when
          several are in play, so without this the organisation awarding the
          access is nowhere on screen. */}
      <Line label={translate('Managed by')} value={call.customer_name} />
      <Line
        label={translate('Submissions opened')}
        value={formatDate(round.start_time)}
      />
      <Line label={translate('Decision expected')} value={decision} />
      <Line
        label={translate('Award duration')}
        value={
          call.fixed_duration_in_days
            ? translate('{count} days', { count: call.fixed_duration_in_days })
            : undefined
        }
      />
      {/* Worth surfacing before the applicant writes anything: it is the one
          field that can mean "do not bother". */}
      {call.has_eligibility_restrictions ? (
        <div className="d-flex align-items-center gap-2 text-warning">
          <WarningCircleIcon weight="bold" />
          {translate(
            'This call restricts who may apply. Check the terms before submitting.',
          )}
        </div>
      ) : null}
      {call.description ? (
        <div className="text-muted mt-2">{call.description}</div>
      ) : null}
      {call.external_url ? (
        <a
          href={call.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1"
        >
          {translate('Call details')}
        </a>
      ) : null}
    </div>
  );
};
