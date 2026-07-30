import {
  CheckCircleIcon,
  ClockIcon,
  WarningCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { FunctionComponent, useId } from 'react';

import { formatDateTime } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

/**
 * Agent-reported propagation state of a single role grant. Rendered
 * next to the role badge on team tables when the offering opted into
 * membership sync status reporting (grants then carry sync_state).
 *
 * null sync_state means "the agent has not reported on this grant" —
 * rendered as no icon at all, deliberately distinct from pending.
 */
interface SyncedGrant {
  role_uuid?: string;
  sync_state?: 'synced' | 'pending' | 'missing_in_idp' | 'error' | null;
  sync_message?: string | null;
  sync_reported_at?: string | null;
}

const STATE_SPECS = {
  synced: {
    Icon: CheckCircleIcon,
    className: 'text-success',
    label: () => translate('Access is active on the provider side.'),
  },
  pending: {
    Icon: ClockIcon,
    className: 'text-warning',
    label: () =>
      translate('Waiting for the provider backend to apply this role.'),
  },
  missing_in_idp: {
    Icon: WarningCircleIcon,
    className: 'text-danger',
    label: () =>
      translate(
        'User is not known to the identity provider yet; access activates after their first login.',
      ),
  },
  error: {
    Icon: XCircleIcon,
    className: 'text-danger',
    label: () => translate('Provider-side synchronization failed.'),
  },
} as const;

export const MemberSyncStateIndicator: FunctionComponent<{
  grant: SyncedGrant;
}> = ({ grant }) => {
  // role_uuid identifies the role, not the grant — several users in one
  // table can hold the same role, so a role-based tooltip id would
  // produce duplicate DOM ids.
  const tooltipId = useId();
  if (!grant.sync_state) {
    return null;
  }
  const spec = STATE_SPECS[grant.sync_state];
  if (!spec) {
    return null;
  }
  const details = [
    grant.sync_message || spec.label(),
    grant.sync_reported_at
      ? translate('Reported: {time}', {
          time: formatDateTime(grant.sync_reported_at),
        })
      : null,
  ]
    .filter(Boolean)
    .join(' — ');
  return (
    <Tip label={details} id={`member-sync-${tooltipId}`}>
      <spec.Icon size={16} weight="fill" className={spec.className} />
    </Tip>
  );
};
