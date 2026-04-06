import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';

interface IconButtonProps {
  /** Icon to display */
  iconNode: ReactNode;
  /** Tooltip text (required for accessibility) */
  tooltip: string;
  /** Click handler */
  onClick: (event: React.MouseEvent) => void;
  /** Bootstrap button variant */
  variant?: ButtonVariant;
  /** Optional inline styles */
  style?: React.CSSProperties;
  /** Disabled state */
  disabled?: boolean;
  /** Loading/pending state - shows spinner */
  pending?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Button type */
  type?: 'button' | 'submit';
  /** Data test ID */
  'data-testid'?: string;
}

/**
 * IconButton - for icon-only buttons with required tooltips.
 * Always renders at large size for visual consistency.
 *
 * @example
 * ```tsx
 * <IconButton
 *   iconNode={<TrashIcon weight="bold" />}
 *   tooltip={translate('Delete')}
 *   onClick={handleDelete}
 *   variant="danger"
 * />
 * ```
 */
export const IconButton: FC<IconButtonProps> = ({
  iconNode,
  tooltip,
  onClick,
  variant = 'tertiary',
  disabled,
  pending,
  className,
  style,
  type = 'button',
  'data-testid': testId,
}) => {
  return (
    <Tip id={`icon-btn-${tooltip.replace(/\s+/g, '-')}`} label={tooltip}>
      <Button
        variant={variant}
        size="lg"
        style={style}
        className={classNames('btn-icon', className, {
          disabled: disabled || pending,
        })}
        onClick={onClick}
        disabled={disabled || pending}
        type={type}
        data-testid={testId}
        aria-label={tooltip}
      >
        {pending ? (
          <LoadingSpinnerIcon />
        ) : (
          <span className="svg-icon svg-icon-2">{iconNode}</span>
        )}
      </Button>
    </Tip>
  );
};

/**
 * CompactIconButton - for icon-only buttons in compact/inline contexts.
 * Uses small size for space-constrained layouts.
 */
export const CompactIconButton: FC<IconButtonProps> = ({
  iconNode,
  tooltip,
  onClick,
  variant = 'tertiary',
  disabled,
  pending,
  className,
  type = 'button',
  'data-testid': testId,
}) => {
  return (
    <Tip id={`icon-btn-${tooltip.replace(/\s+/g, '-')}`} label={tooltip}>
      <Button
        variant={variant}
        size="sm"
        className={classNames('btn-icon', className, {
          disabled: disabled || pending,
        })}
        onClick={onClick}
        disabled={disabled || pending}
        type={type}
        data-testid={testId}
        aria-label={tooltip}
      >
        {pending ? (
          <LoadingSpinnerIcon />
        ) : (
          <span className="svg-icon svg-icon-4">{iconNode}</span>
        )}
      </Button>
    </Tip>
  );
};
