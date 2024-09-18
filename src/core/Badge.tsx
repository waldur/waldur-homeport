import classNames from 'classnames';
import { FunctionComponent } from 'react';
import BsBadge, { BadgeProps } from 'react-bootstrap/Badge';
import type { Variant } from 'react-bootstrap/types';

import { Tip } from '@waldur/core/Tooltip';

interface OwnProps extends BadgeProps {
  tooltip?: string;
  variant?: Variant;
  roundless?: boolean;
  light?: boolean;
  outline?: boolean;
  pill?: boolean;
  hasBullet?: boolean;
  size?: 'sm' | 'lg';
}

const wrapTooltip = (label, children) =>
  label ? (
    <Tip label={label} id="state-indicator">
      {children}
    </Tip>
  ) : (
    children
  );

export const Badge: FunctionComponent<OwnProps> = ({
  variant = 'primary',
  tooltip,
  roundless,
  light,
  outline,
  pill,
  hasBullet,
  size,
  className,
  children,
  ...rest
}) =>
  wrapTooltip(
    tooltip,
    <BsBadge
      bg={!(light || outline) ? variant : null}
      className={classNames([
        'badge-' +
          (outline
            ? 'outline-'
            : light && variant !== 'light'
              ? 'light-'
              : '') +
          variant,
        size && `badge-${size}`,
        roundless && 'rounded-0',
        pill && 'badge-pill',
        hasBullet && 'has-bullet',
        className,
      ])}
      {...rest}
    >
      {children}
    </BsBadge>,
  );
