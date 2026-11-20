import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import noDisplayDateTokens from './no-display-date-tokens.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  },
});

const error = { messageId: 'displayToken' };

describe('no-display-date-tokens', () => {
  ruleTester.run('no-display-date-tokens', noDisplayDateTokens as any, {
    valid: [
      // Machine formats: keys, API values, ISO-like labels.
      { code: `d.toFormat('yyyy-MM');` },
      { code: `d.toFormat('yyyy-MM-dd');` },
      { code: `d.toFormat('yyyy-MM-dd HH:mm');` },
      { code: `d.toFormat("yyyy-MM-dd'T'HH:mm:ss");` },
      { code: `d.toFormat('yyyy');` },
      { code: `d.toFormat('HH:mm');` },
      { code: `d.toFormat('Z');` },
      // A Duration in clock form.
      { code: `Duration.fromObject({ hours }).toFormat('hh:mm:ss');` },
      // Quoted literals are not tokens.
      { code: `d.toFormat("yyyy'Q'q");` },
      { code: `const FMT = 'yyyy-MM'; d.toFormat(FMT);` },
      // A let can change, so it is not judged.
      { code: `let fmt = 'MMM yyyy'; fmt = 'yyyy'; d.toFormat(fmt);` },
      // A dynamic format can't be judged statically.
      { code: `d.toFormat(MASK_FORMATS[mask]);` },
      // The replacements.
      { code: `formatMonth(d);` },
    ],
    invalid: [
      { code: `d.toFormat('d LLL yyyy');`, errors: [error] },
      { code: `d.toFormat('MMMM yyyy');`, errors: [error] },
      { code: `d.toFormat('LLLL');`, errors: [error] },
      { code: `d.toFormat('MMM dd');`, errors: [error] },
      { code: `d.toFormat('ccc');`, errors: [error] },
      { code: `d.toFormat('DDD');`, errors: [error] },
      { code: `d.toFormat('d LLL yyyy, t');`, errors: [error] },
      { code: `d.toFormat('hh:mm a');`, errors: [error] },
      // Numeric dates that do not start with the year are regional.
      { code: `d.toFormat("dd'.'MM'.'yyyy HH:mm");`, errors: [error] },
      { code: `d.toFormat('MM/yyyy');`, errors: [error] },
      { code: 'd.toFormat(`MMM yyyy`);', errors: [error] },
      // A const holding a display format.
      { code: `const FMT = 'MMM yyyy'; d.toFormat(FMT);`, errors: [error] },
      {
        code: `const FMT = 'd LLL yyyy'; const f = (d) => d.toFormat(FMT);`,
        errors: [error],
      },
    ],
  });
});
