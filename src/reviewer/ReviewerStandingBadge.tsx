import { FC } from 'react';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

export const getStandingLabel = (standing: string) =>
  ({
    active: translate('Active'),
    suspended: translate('Suspended'),
    blocked: translate('Blocked'),
  })[standing] ?? standing;

/** Whether a reviewer with this standing may take on new review work. */
export const isInGoodStanding = (standing?: string | null) =>
  !standing || standing === 'active';

/**
 * A reviewer's standing with the platform operator. Shown only when it is not
 * active, unless `showActive` -- in the pool and discovery views an active
 * reviewer needs no mark.
 */
export const ReviewerStandingBadge: FC<{
  standing?: string | null;
  showActive?: boolean;
}> = ({ standing, showActive }) => {
  if (!standing || (standing === 'active' && !showActive)) {
    return null;
  }
  return (
    <Badge
      variant={
        standing === 'active'
          ? 'success'
          : standing === 'blocked'
            ? 'danger'
            : 'warning'
      }
      shape="pill"
      tone="outline"
      tooltip={
        standing === 'active'
          ? undefined
          : translate(
              'Not in good standing with the platform operator: takes on no new review work.',
            )
      }
    >
      {getStandingLabel(standing)}
    </Badge>
  );
};
