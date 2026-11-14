import { FC } from 'react';
import { Project } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

import { getEndDateStatus } from './endDateStatus';

const APPROACHING_DAYS = 30;

interface ProjectLifecycleBadgeProps {
  project: Pick<
    Project,
    'end_date' | 'effective_end_date' | 'is_in_grace_period'
  >;
  className?: string;
}

/**
 * Inline status indicator for a project's lifecycle.
 *
 * Shows a small badge in one of these states, decided from the dates (see
 * getEndDateStatus):
 *   - "Expired" (red) — on or past effective_end_date
 *   - "In grace, N days left" (yellow) — within grace period
 *   - "N days left" / "Last day" (yellow) — within 30 days of an end date
 *     with no grace period, counted to the last usable day
 *   - "Ends in N days" / "Ends today" (yellow) — within 30 days of an end
 *     date that a grace period follows
 *
 * Returns null when end_date is unset or the project is more than 30 days
 * from its end date (so we don't add noise to long-lived projects).
 */
export const ProjectLifecycleBadge: FC<ProjectLifecycleBadgeProps> = ({
  project,
  className,
}) => {
  const status = getEndDateStatus(project, APPROACHING_DAYS);
  if (!status) return null;

  if (status.kind === 'expired') {
    return (
      <Badge
        variant="danger"
        size="sm"
        shape="pill"
        tone="outline"
        className={className}
      >
        {translate('Expired')}
      </Badge>
    );
  }

  let label: string;
  if (status.kind === 'grace') {
    label =
      status.daysLeft === 0
        ? translate('In grace, last day')
        : translate('In grace, {n}d left', { n: String(status.daysLeft) });
  } else if (status.endsAccess) {
    label =
      status.daysLeft === 0
        ? translate('Last day')
        : translate('{n}d left', { n: String(status.daysLeft) });
  } else {
    label =
      status.daysLeft === 0
        ? translate('Ends today')
        : translate('Ends in {n}d', { n: String(status.daysLeft) });
  }

  return (
    <Badge
      variant="warning"
      size="sm"
      shape="pill"
      tone="outline"
      className={className}
    >
      {label}
    </Badge>
  );
};
