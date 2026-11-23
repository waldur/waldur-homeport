import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import noBrowserLocaleDate from './no-browser-locale-date.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  },
});

const error = { messageId: 'browserLocale' };

describe('no-browser-locale-date', () => {
  ruleTester.run('no-browser-locale-date', noBrowserLocaleDate as any, {
    valid: [
      { code: `d.toLocaleDateString(getDateLocale(), { month: 'short' });` },
      { code: `d.toLocaleTimeString(locale);` },
      { code: `new Intl.DateTimeFormat(getDateLocale(), opts);` },
      // Numbers: toLocaleString without date options is not a date.
      { code: `n.toLocaleString();` },
      { code: `n.toLocaleString(undefined, { maximumFractionDigits: 2 });` },
      // Luxon's toLocaleString takes the preset first, the locale in opts.
      { code: `dt.toLocaleString(DateTime.DATE_MED, { locale: l });` },
      { code: `formatDate(d);` },
      { code: `const l = getDateLocale(); d.toLocaleDateString(l);` },
      { code: `new Date().toLocaleString(getDateLocale());` },
    ],
    invalid: [
      { code: `d.toLocaleDateString();`, errors: [error] },
      {
        code: `d.toLocaleDateString(undefined, { month: 'long' });`,
        errors: [error],
      },
      {
        code: `d.toLocaleTimeString(getUserLocale(), { hour: '2-digit' });`,
        errors: [error],
      },
      {
        code: `d.toLocaleString(undefined, { month: 'short', day: 'numeric' });`,
        errors: [error],
      },
      {
        code: `new Intl.DateTimeFormat(undefined, { year: 'numeric' });`,
        errors: [error],
      },
      { code: `Intl.DateTimeFormat();`, errors: [error] },
      // A Date with no options is still a date.
      { code: `new Date(ms).toLocaleString();`, errors: [error] },
      // Locale or options held in a const.
      {
        code: `const l = getUserLocale(); d.toLocaleDateString(l);`,
        errors: [error],
      },
      {
        code: `const O = { month: 'short' }; d.toLocaleString(undefined, O);`,
        errors: [error],
      },
    ],
  });
});
