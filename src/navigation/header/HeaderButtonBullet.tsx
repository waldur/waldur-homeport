import classNames from 'classnames';

export const HeaderButtonBullet = ({
  size = 6,
  blink = true,
  variant = 'success',
  className = null,
}) => (
  <span
    className={classNames(
      `bullet bullet-dot bg-${variant} h-${size}px w-${size}px position-absolute translate-middle top-0 end-0`,
      blink && 'animation-blink',
      className,
    )}
  />
);
