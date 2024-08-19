import classNames from 'classnames';

export const HeaderButtonBullet = ({
  size = 6,
  blink = true,
  className = null,
}) => (
  <span
    className={classNames(
      `bullet bullet-dot bg-success h-${size}px w-${size}px position-absolute translate-middle top-0 end-0`,
      blink && 'animation-blink',
      className,
    )}
  />
);
