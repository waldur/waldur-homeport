import { FC, ReactNode } from 'react';
import MediaQuery from 'react-responsive';

import { BaseButton } from '@/core/buttons/BaseButton';
import { Tip } from '@/core/Tooltip';

/** @deprecated Use BaseButton or a button component with built-in tooltip support */
export const wrapTooltip = (label, children, rest?) =>
  label ? (
    <Tip label={label} id="button-tooltip" {...rest}>
      {children}
    </Tip>
  ) : (
    children
  );

interface ActionButtonProps {
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
  /** Responsive visibility constraints */
  visibility?: {
    minWidth?: number;
    maxWidth?: number;
  };
  /** Data test ID */
  'data-testid'?: string;
}

/**
 * ActionButton - for panel/card header actions.
 * Always renders at large size for visual consistency.
 * Use CompactActionButton for inline contexts.
 */
export const ActionButton: FC<ActionButtonProps> = ({
  title,
  action,
  variant = 'tertiary',
  visibility,
  ...props
}) => {
  const button = (
    <BaseButton
      label={title}
      onClick={action}
      variant={variant}
      size="lg"
      {...props}
    />
  );

  return visibility ? (
    <MediaQuery {...visibility}>{button}</MediaQuery>
  ) : (
    button
  );
};
