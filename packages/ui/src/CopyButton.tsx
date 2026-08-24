import { CopyIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { BaseButton } from './BaseButton';

export interface CopyButtonProps {
  value: string;
  /** Already translated by the caller — this package has no i18n dependency
   * of its own (see Sidebar.tsx's hardcoded aria-labels for the same
   * boundary), so text always arrives as a prop, never a translate() call
   * made in here. */
  label: string;
  copiedLabel: string;
  className?: string;
}

/**
 * UserToken.tsx/UserIpAddress.tsx's real copy buttons show a toast via
 * @/store/notify, a whole app-wide notification system with no equivalent
 * in a standalone consumer — a transient label swap on the button itself
 * (label → copiedLabel, then back) is the honest equivalent, not a
 * fabricated toast. Extracted here after the same value/label/onClick/
 * useState shape showed up twice in OrgDashboardMock.tsx (API token, IP
 * address) with nothing app-specific about it.
 */
export function CopyButton({
  value,
  label,
  copiedLabel,
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <BaseButton
      variant="tertiary"
      size="sm"
      iconNode={<CopyIcon weight="bold" />}
      label={copied ? copiedLabel : label}
      onClick={handleClick}
      className={className}
    />
  );
}
