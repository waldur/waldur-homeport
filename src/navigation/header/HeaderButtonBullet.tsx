import classNames from 'classnames';
import { CSSProperties, FC } from 'react';

// `primary` is the brand: bg-primary is the page surface, which made the dot
// white. A mark on the header, not a fill under text, so it reads the brand
// text role: the tenant colour in light, a lighter step on the dark header.
const BULLET_COLORS = {
  success: 'bg-success',
  danger: 'bg-danger',
  primary: 'bg-[var(--text-brand)]',
  'gray-500': 'bg-gray-500 dark:bg-gray-dark-400',
};

export type HeaderButtonBulletVariant = keyof typeof BULLET_COLORS;

const SIZES: Record<number, string> = {
  6: 'size-[6px]',
  8: 'size-[8px]',
  9: 'size-[9px]',
  10: 'size-[10px]',
};

export interface HeaderButtonBulletProps {
  size?: number;
  blink?: boolean;
  variant?: HeaderButtonBulletVariant;
  className?: string;
  style?: CSSProperties;
  'data-testid'?: string;
}

export const HeaderButtonBullet: FC<HeaderButtonBulletProps> = ({
  size = 6,
  blink = true,
  variant = 'success',
  className = null,
  style,
  ...rest
}) => (
  <span
    className={classNames(
      'inline-block shrink-0 rounded-full absolute top-0 end-0 -translate-x-1/2 -translate-y-1/2',
      BULLET_COLORS[variant],
      SIZES[size],
      blink && 'animation-blink',
      className,
    )}
    style={{ width: size, height: size, ...style }}
    {...rest}
  />
);
