import { IdentificationBadgeIcon } from '@phosphor-icons/react';
import { uniqueId } from 'lodash-es';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

interface StaffOnlyIndicatorProps {
  className?: string;
}

export const StaffOnlyIndicator = ({
  className = 'text-dark me-1',
}: StaffOnlyIndicatorProps) => (
  <Tip
    label={translate('Staff action')}
    id={`staff-action-${uniqueId()}`}
    className={className}
  >
    <IdentificationBadgeIcon size={22} weight="bold" />
  </Tip>
);
