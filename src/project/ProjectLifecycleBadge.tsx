import { FC } from 'react';
import { Project } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';

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
 * Shows a small badge in one of three states, in priority order:
 *   - "Expired" (red) — past effective_end_date
 *   - "In grace, N days left" (yellow) — within grace period
 *   - "Ends in N days" / "Ends today" (yellow) — within 30 days of end_date
 *
 * Returns null when end_date is unset or the project is more than 30 days
 * from its end date (so we don't add noise to long-lived projects).
 */
export const ProjectLifecycleBadge: FC<ProjectLifecycleBadgeProps> = ({
  project,
  className,
}) => {
  if (!project.end_date) return null;

  const today = new Date();
  const endDateObj = new Date(project.end_date);
  const effectiveEndDateObj = project.effective_end_date
    ? new Date(project.effective_end_date)
    : endDateObj;

  if (project.is_in_grace_period) {
    const daysLeft = Math.max(
      0,
      Math.ceil((effectiveEndDateObj.getTime() - today.getTime()) / 86400000),
    );
    return (
      <Badge variant="warning" size="sm" pill outline className={className}>
        {translate('In grace, {n}d left', { n: String(daysLeft) })}
      </Badge>
    );
  }

  if (effectiveEndDateObj < today) {
    return (
      <Badge variant="danger" size="sm" pill outline className={className}>
        {translate('Expired')}
      </Badge>
    );
  }

  const daysToEnd = Math.ceil(
    (endDateObj.getTime() - today.getTime()) / 86400000,
  );
  if (daysToEnd >= 0 && daysToEnd <= APPROACHING_DAYS) {
    return (
      <Badge variant="warning" size="sm" pill outline className={className}>
        {daysToEnd === 0
          ? translate('Ends today')
          : translate('Ends in {n}d', { n: String(daysToEnd) })}
      </Badge>
    );
  }

  return null;
};
