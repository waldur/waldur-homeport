import { IdentificationBadgeIcon } from '@phosphor-icons/react';

import { HelpIcon, Tooltip } from 'waldur-ui';

import { translate } from '@/i18n';

interface StaffOnlyIndicatorProps {
  className?: string;
  /**
   * The marker sits inside another control (a menu item, a tab), which cannot
   * hold a button. It is then a named image, read as part of that control's
   * name, with the tooltip on hover.
   */
  inControl?: boolean;
  /** With `inControl`: the control already says it is a staff action, for
   *  example through its accessible description. */
  'aria-hidden'?: boolean;
}

export const StaffOnlyIndicator = ({
  className = 'text-primary me-1',
  inControl,
  'aria-hidden': ariaHidden,
}: StaffOnlyIndicatorProps) =>
  inControl ? (
    <Tooltip label={translate('Staff action')}>
      <span
        role={ariaHidden ? undefined : 'img'}
        aria-label={ariaHidden ? undefined : translate('Staff action')}
        aria-hidden={ariaHidden || undefined}
        className="inline-flex"
      >
        <IdentificationBadgeIcon
          size={22}
          weight="bold"
          aria-hidden="true"
          className={className}
        />
      </span>
    </Tooltip>
  ) : (
    <HelpIcon
      label={translate('Staff action')}
      aria-label={translate('Staff action')}
      icon={IdentificationBadgeIcon}
      size={22}
      className={className}
    />
  );
