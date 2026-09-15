import { ShieldWarningIcon, WarningIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Tooltip } from 'waldur-ui';

import { Badge } from '@/core/Badge';
import { formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';

import { InvitationStatusBadge } from './InvitationStatusBadge';
import { CallReviewerPoolExtended } from './types';

// Check if invitation is about to expire (within 7 days)
const isExpiringS = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false;
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const daysUntilExpiry =
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
};

const isExpired = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};

interface ReviewerInvitationStatusProps {
  row: CallReviewerPoolExtended;
}

export const ReviewerInvitationStatus: FC<ReviewerInvitationStatusProps> = ({
  row,
}) => {
  return (
    <div className="d-flex align-items-center gap-2" style={{ minWidth: 220 }}>
      <InvitationStatusBadge
        status={row.invitation_status}
        statusDisplay={row.invitation_status_display}
      />
      {row.invitation_status === 'pending' &&
        isExpiringS(row.invitation_expires_at) && (
          <Tooltip
            label={translate('Expires {date}', {
              date: formatRelative(row.invitation_expires_at),
            })}
          >
            <WarningIcon size={16} weight="bold" className="text-warning" />
          </Tooltip>
        )}
      {isExpired(row.invitation_expires_at) &&
        row.invitation_status === 'pending' && (
          <Badge variant="danger" outline>
            {translate('Expired')}
          </Badge>
        )}
      {row.override_reason && (
        <Tooltip
          label={
            row.overridden_by_name
              ? translate('Overridden by {user}: {reason}', {
                  user: row.overridden_by_name,
                  reason: row.override_reason,
                })
              : translate('Override reason: {reason}', {
                  reason: row.override_reason,
                })
          }
        >
          <Badge
            variant="warning"
            leftIcon={<ShieldWarningIcon size={14} weight="bold" />}
            outline
          >
            {translate('Overridden')}
          </Badge>
        </Tooltip>
      )}
    </div>
  );
};
