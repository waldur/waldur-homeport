import { WarningCircleIcon } from '@phosphor-icons/react';
import { translate } from 'waldur-i18n-runtime';

import { HelpIcon, HelpIconProps } from './HelpIcon';

/**
 * A warning icon with a tooltip, as a real focusable button. `HelpIcon` in the
 * warning colour with a "Warning" accessible name; override `icon` or
 * `aria-label` when something more specific fits.
 */
export const WarningTip = ({
  icon = WarningCircleIcon,
  'aria-label': ariaLabel = translate('Warning'),
  ...rest
}: Omit<HelpIconProps, 'tone'>) => (
  <HelpIcon icon={icon} tone="warning" aria-label={ariaLabel} {...rest} />
);
