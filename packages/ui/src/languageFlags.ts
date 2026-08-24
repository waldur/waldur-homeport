// Same language→country mapping as LanguageSelectorDropdown.tsx's real
// LanguageCountry map (src/navigation/header/LanguageSelectorDropdown.tsx) —
// reused here to render a Unicode flag emoji instead of porting that
// component's flag-icon sprite sheet (src/core/CountryFlagIcon.tsx's
// flags.svg plus a ~200-country SCSS position map), which is a lot of extra
// asset weight for one dropdown row in a demo app.
const LANGUAGE_COUNTRY: Record<string, string> = {
  ar: 'sa',
  bg: 'bg',
  cs: 'cz',
  da: 'dk',
  de: 'de',
  el: 'gr',
  en: 'gb',
  es: 'es',
  et: 'ee',
  fr: 'fr',
  it: 'it',
  km: 'kh',
  lt: 'lt',
  lv: 'lv',
  nb: 'no',
  ru: 'ru',
  sl: 'si',
  sv: 'se',
  uk: 'ua',
};

// Standard regional-indicator-symbol trick: each letter of a two-letter ISO
// country code maps 1:1 onto a Unicode regional indicator symbol, and the
// pair renders as that country's flag emoji in every mainstream renderer.
function countryFlagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function getLanguageFlag(languageCode: string): string | undefined {
  const countryCode = LANGUAGE_COUNTRY[languageCode];
  return countryCode ? countryFlagEmoji(countryCode) : undefined;
}
