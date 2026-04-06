import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';

import { Badge } from '@waldur/core/Badge';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';

interface ToolbarButtonProps {
  /** Button text label (optional for icon-only buttons) */
  title?: string;
  /** Tooltip text shown on hover */
  tooltip?: string;
  /** Tooltip shown only when button is disabled/pending */
  disabledReason?: string;
  /** Icon to display */
  iconNode: ReactNode;
  /** Click handler */
  onClick: (event: React.MouseEvent) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Loading/pending state - shows spinner */
  pending?: boolean;
  /** Bootstrap button variant */
  variant?: ButtonVariant;
  /** Bootstrap button size */
  size?: 'sm' | 'lg';
  /** Badge count to display (e.g., for filter count) */
  badge?: number | string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ToolbarButton - for table/panel toolbar actions.
 */
export const ToolbarButton: FC<ToolbarButtonProps> = ({
  title,
  tooltip,
  disabledReason,
  iconNode,
  onClick,
  disabled,
  pending,
  variant = 'tertiary',
  size = 'lg',
  badge,
  className,
}) => {
  const isIconOnly = !title;
  const isDisabled = disabled || pending;
  const effectiveTooltip = isDisabled ? (disabledReason ?? tooltip) : tooltip;

  const button = (
    <Button
      variant={variant}
      className={classNames(
        className,
        isIconOnly && 'btn-icon',
        badge !== undefined && 'position-relative',
        { disabled: isDisabled },
      )}
      size={size}
      onClick={onClick}
      disabled={isDisabled}
    >
      {pending ? (
        <LoadingSpinnerIcon />
      ) : (
        <span className="svg-icon svg-icon-2">{iconNode}</span>
      )}
      {title && <span className="ms-1">{title}</span>}
      {badge !== undefined && badge !== 0 && (
        <Badge
          variant="primary"
          size="sm"
          pill
          outline
          className="position-absolute top-0 start-100 translate-middle fs-7"
        >
          {typeof badge === 'number' && badge > 9 ? '9+' : badge}
        </Badge>
      )}
    </Button>
  );

  if (effectiveTooltip) {
    return (
      <Tip
        id={`toolbar-btn-${effectiveTooltip.replace(/\s+/g, '-')}`}
        label={effectiveTooltip}
      >
        {button}
      </Tip>
    );
  }

  return button;
};
