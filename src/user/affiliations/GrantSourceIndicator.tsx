import { RobotIcon, UserIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { Tooltip } from 'waldur-ui';

import { translate } from '@/i18n';

/**
 * Where a role grant came from.
 *
 * `source` is empty for anything a person granted — an invitation, an owner
 * adding a member, staff. A non-empty value means the grant is managed by a
 * machine and may be revoked automatically when the identity provider stops
 * asserting it, which is exactly the thing a user needs explaining when a role
 * disappears without anyone having touched it.
 */
export const formatGrantSource = (source?: string | null): string | null => {
  if (!source) return null;
  if (source.startsWith('rule:')) {
    return translate('Auto-provisioning rule');
  }
  return source;
};

export const GrantSourceIndicator: FunctionComponent<{
  source?: string | null;
  uuid?: string;
}> = ({ source }) => {
  const label = formatGrantSource(source);
  if (!label) {
    return (
      <Tooltip label={translate('Granted by a person.')}>
        <span className="text-muted d-inline-flex align-items-center gap-1">
          <UserIcon size={16} weight="bold" />
          {translate('Manual')}
        </span>
      </Tooltip>
    );
  }
  return (
    <Tooltip
      label={translate(
        'Granted automatically from identity provider data ({source}). It may be revoked automatically if the user stops matching.',
        { source },
      )}
    >
      <span className="text-primary d-inline-flex align-items-center gap-1">
        <RobotIcon size={16} weight="bold" />
        {label}
      </span>
    </Tooltip>
  );
};
