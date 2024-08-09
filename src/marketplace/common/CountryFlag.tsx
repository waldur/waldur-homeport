import { FunctionComponent } from 'react';

/* Refer to:
 * "ISO Country Code to Unicode Flag in C♯ and JavaScript - Alan Edwardes"
 * https://alanedwardes.com/blog/posts/country-code-to-flag-emoji-csharp/
 */
const isoCountryCodeToFlagEmoji = (country) =>
  String.fromCodePoint(
    ...[...country.toUpperCase()].map((c) => c.charCodeAt() + 0x1f1a5),
  );

interface CountryFlagProps {
  countryCode: string;
  fontSize?: number;
}

export const CountryFlag: FunctionComponent<CountryFlagProps> = ({
  countryCode,
  fontSize = 24,
}) => (
  <span style={{ fontSize: fontSize + 'px' }}>
    {isoCountryCodeToFlagEmoji(countryCode)}
  </span>
);
