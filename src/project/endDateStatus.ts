import { DateTime } from 'luxon';
import { Project } from 'waldur-js-client';

import { daysUntilAccessEnds, parseDate } from '@/core/dateUtils';

/** Where a project stands against its end dates. */
export type EndDateStatus =
  /**
   * Within the approaching window of end_date. When `endsAccess` (no grace
   * period), end_date is the day access is lost and `daysLeft` counts to the
   * day before it. Otherwise end_date is the last day before the grace period
   * and `daysLeft` counts to end_date itself.
   */
  | { kind: 'approaching'; daysLeft: number; endsAccess: boolean }
  /** In the grace period; `daysLeft` counts to the last day of access. */
  | { kind: 'grace'; daysLeft: number }
  /** Access has ended; 0 on the effective end date itself. */
  | { kind: 'expired'; daysAgo: number };

/**
 * A project's end-date state, decided from the dates on the backend's rules
 * rather than from `is_in_grace_period` alone:
 *
 * - expired from `effective_end_date` on, the day itself included
 *   (`Project.is_expired` is `effective_end_date <= today`, and resources are
 *   terminated that day);
 * - in the grace period while `end_date < today < effective_end_date`;
 * - otherwise approaching, when within `approachingDays`.
 *
 * The backend still reports `is_in_grace_period` on the effective end date,
 * which is why the dates decide here: on that day access is already gone.
 */
export const getEndDateStatus = (
  project: Pick<Project, 'end_date' | 'effective_end_date'>,
  approachingDays: number,
): EndDateStatus | null => {
  if (!project.end_date) {
    return null;
  }
  const today = DateTime.now().startOf('day');
  const end = parseDate(project.end_date).startOf('day');
  const accessEnds = project.effective_end_date
    ? parseDate(project.effective_end_date).startOf('day')
    : end;

  if (today >= accessEnds) {
    return {
      kind: 'expired',
      daysAgo: Math.round(today.diff(accessEnds, 'days').days),
    };
  }
  if (today > end) {
    return { kind: 'grace', daysLeft: daysUntilAccessEnds(accessEnds) };
  }
  const endsAccess = accessEnds <= end;
  const daysLeft = endsAccess
    ? daysUntilAccessEnds(end)
    : Math.round(end.diff(today, 'days').days);
  return daysLeft <= approachingDays
    ? { kind: 'approaching', daysLeft, endsAccess }
    : null;
};
