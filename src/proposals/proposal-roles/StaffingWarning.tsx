import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { WarningTip } from 'waldur-ui';

/**
 * The backend's word that the call has fewer people than a role or a step
 * needs, shown where the role or step is configured. ``compact`` puts the
 * text in a tooltip behind the icon, for a crowded table cell.
 */
export const StaffingWarning: FC<{
  warning?: string | null;
  compact?: boolean;
}> = ({ warning, compact }) => {
  if (!warning) {
    return null;
  }
  if (compact) {
    return (
      <WarningTip
        label={warning}
        aria-label={warning}
        data-testid="staffing-warning"
      />
    );
  }
  return (
    <span
      className="text-warning inline-flex items-start gap-1"
      data-testid="staffing-warning"
    >
      <WarningCircleIcon weight="bold" className="mt-1 shrink-0" />
      <span>{warning}</span>
    </span>
  );
};
