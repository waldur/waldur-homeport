import { IdentificationBadgeIcon } from '@phosphor-icons/react';

import { Tooltip } from 'waldur-ui';

import { translate } from '@/i18n';

interface StaffOnlyIndicatorProps {
  className?: string;
}

export const StaffOnlyIndicator = ({
  className = 'text-dark me-1',
}: StaffOnlyIndicatorProps) => (
  <Tooltip label={translate('Staff action')}>
    <IdentificationBadgeIcon size={22} weight="bold" className={className} />
  </Tooltip>
);
