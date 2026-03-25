import { FC, ReactNode } from 'react';

import { BaseButton } from '@waldur/core/buttons/BaseButton';

interface CompactActionButtonProps {
  /** Button text */
  title?: string;
  /** Click handler */
  action: (event?: any) => void;
  /** Optional icon to display */
  iconNode?: ReactNode;
  /** Place icon on the right side (default: left) */
  iconRight?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Tooltip text */
  tooltip?: string;
  /** Tooltip shown only when button is disabled/pending */
  disabledReason?: string;
  /** Bootstrap button variant - defaults to 'tertiary' */
  variant?: string;
  /** Loading state - shows spinner and disables button */
  pending?: boolean;
}

/**
 * Compact action button for inline contexts like dropdowns, form fields, and table cells.
 * Uses small size to fit within constrained spaces.
 *
 * For panel/card header actions, use ActionButton instead (which uses large size).
 */
export const CompactActionButton: FC<CompactActionButtonProps> = ({
  title,
  action,
  variant = 'tertiary',
  ...props
}) => (
  <BaseButton
    label={title}
    onClick={action}
    variant={variant}
    size="sm"
    {...props}
  />
);
