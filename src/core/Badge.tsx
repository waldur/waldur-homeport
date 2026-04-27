import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import BsBadge, { BadgeProps } from 'react-bootstrap/Badge';
import type { Variant } from 'react-bootstrap/types';

import { Tip, TipProps } from '@/core/Tooltip';

interface OwnProps extends BadgeProps {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onlyIcon?: boolean;
  alignIcon?: boolean;
  tooltip?: ReactNode;
  tooltipProps?: Partial<TipProps>;
  variant?:
    | Variant
    | 'pink'
    | 'blue'
    | 'teal'
    | 'indigo'
    | 'purple'
    | 'rose'
    | 'orange'
    | 'moss';
  roundless?: boolean;
  light?: boolean;
  outline?: boolean;
  pill?: boolean;
  hasBullet?: boolean;
  size?: 'sm' | 'lg';
}

const wrapTooltip = (label, children, props = {}) =>
  label ? (
    <Tip label={label} id="tip-badge" {...props}>
      {children}
    </Tip>
  ) : (
    children
  );

export const Badge: FC<OwnProps> = ({
  variant = 'primary',
  leftIcon,
  rightIcon,
  onlyIcon,
  alignIcon,
  tooltip,
  tooltipProps,
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
        leftIcon && 'has-left-icon',
        rightIcon && 'has-right-icon',
        hasBullet && 'has-bullet',
        onlyIcon && 'badge-icon',
        alignIcon && 'icon-align',
        className,
      ])}
      {...rest}
    >
      {Boolean(leftIcon) && <span className="left-icon">{leftIcon}</span>}
      {children}
      {Boolean(rightIcon) && <span className="right-icon">{rightIcon}</span>}
    </BsBadge>,
    tooltipProps,
  );
