import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';

interface ToolbarButtonProps {
  /** Button text label (optional for icon-only buttons) */
  title?: string;
  /** Tooltip text shown on hover */
  tooltip?: string;
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
  /** Badge count to display (e.g., for filter count) */
  badge?: number | string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ToolbarButton - for table/panel toolbar actions.
 * Uses small size to match table header design.
 */
export const ToolbarButton: FC<ToolbarButtonProps> = ({
  title,
  tooltip,
  iconNode,
  onClick,
  disabled,
  pending,
  variant = 'tertiary',
  badge,
  className,
}) => {
  const isIconOnly = !title;

  const button = (
    <Button
      variant={variant}
      className={classNames(
        className,
        isIconOnly && 'btn-icon',
        badge !== undefined && 'position-relative',
        { disabled: disabled || pending },
      )}
      size="sm"
      onClick={onClick}
      disabled={disabled || pending}
    >
      {pending ? (
        <LoadingSpinnerIcon />
      ) : (
        <span className="svg-icon svg-icon-2">{iconNode}</span>
      )}
      {title && <span className="ms-1">{title}</span>}
      {badge !== undefined && badge !== 0 && (
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger fs-9">
          {typeof badge === 'number' && badge > 9 ? '9+' : badge}
        </span>
      )}
    </Button>
  );

  if (tooltip) {
    return (
      <Tip id={`toolbar-btn-${tooltip.replace(/\s+/g, '-')}`} label={tooltip}>
        {button}
      </Tip>
    );
  }

  return button;
};
