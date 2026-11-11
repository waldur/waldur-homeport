import classNames from 'classnames';
import { CSSProperties, FC, HTMLAttributes, PropsWithChildren } from 'react';

export const getPlaceholderFontSize = (size?: string | number): number => {
  if (size === undefined || size === null) return 18;
  const s = typeof size === 'string' ? Number(size.split('px')[0]) : size;
  if (!s || Number.isNaN(s)) return 18;
  else if (s <= 24) return 12;
  else if (s <= 32) return 14;
  else if (s <= 40) return 16;
  else if (s <= 48) return 18;
  else if (s <= 56) return 20;
  else return 24;
};

export interface ImagePlaceholderProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
  circle?: boolean;
  minWidth?: string | number;
  className?: string;
  style?: CSSProperties;
}

export const ImagePlaceholder: FC<PropsWithChildren<ImagePlaceholderProps>> = ({
  width = '24px',
  height = '24px',
  backgroundColor,
  circle,
  minWidth,
  className,
  style,
  children,
  ...rest
}) => {
  return (
    <div
      data-testid="image-placeholder"
      className={classNames(
        'inline-flex items-center justify-center shrink-0 font-medium text-lg text-quaternary bg-tertiary',
        circle ? 'rounded-full' : 'rounded-lg',
        className,
      )}
      style={{
        width,
        minWidth,
        height,
        backgroundColor,
        // eslint-disable-next-line waldur-custom/require-font-size-scale -- Dynamic font-size calculated proportionally to placeholder width
        fontSize: getPlaceholderFontSize(width) + 'px',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};
