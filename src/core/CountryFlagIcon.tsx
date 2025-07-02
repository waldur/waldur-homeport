import classNames from 'classnames';
import './CountryFlagIcon.scss';

interface CountryFlagIconProps {
  countryCode: string;
  size?: 'sm';
  className?: string;
}

export const CountryFlagIcon = ({
  countryCode,
  size,
  className,
}: CountryFlagIconProps) => (
  <span
    className={classNames(
      `flag-icon flag-${countryCode.toLowerCase()}`,
      size && `flag-icon-${size}`,
      className,
    )}
  />
);
