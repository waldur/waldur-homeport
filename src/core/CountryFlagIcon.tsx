import classNames from 'classnames';
import './CountryFlagIcon.scss';

interface CountryFlagIconProps {
  /** ISO country code. Callers map from other domains (e.g. language code ->
   * country) and can legitimately come up empty, so this is optional. */
  countryCode?: string;
  size?: 'sm';
  className?: string;
}

export const CountryFlagIcon = ({
  countryCode,
  size,
  className,
}: CountryFlagIconProps) => {
  // No flag beats a crash: an unmapped code used to blow up on toLowerCase and
  // take the whole surrounding layout down with it.
  if (!countryCode) {
    return null;
  }
  return (
    <span
      data-testid="country-flag"
      className={classNames(
        `flag-icon flag-${countryCode.toLowerCase()}`,
        size && `flag-icon-${size}`,
        className,
      )}
    />
  );
};
