import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import preferTypedProperty from './prefer-typed-property.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
});

const filename = '/tmp/prefer-typed-property/Example.tsx';

const prefer = (replacement: string) => ({
  messageId: 'prefer',
  data: { replacement },
});

describe('prefer-typed-property', () => {
  ruleTester.run('prefer-typed-property', preferTypedProperty as any, {
    valid: [
      { filename, code: '<PropertyItem label="a" value={row.name} />' },
      { filename, code: '<DateProperty label="a" value={row.created} />' },
      // A value composing more than one formatter is left alone.
      {
        filename,
        code: '<PropertyItem label="a" value={`${formatDate(a)} – ${formatDate(b)}`} />',
      },
      // Not a row.
      { filename, code: '<Tooltip label={formatDateTime(row.created)} />' },
      // A ternary between other words.
      {
        filename,
        code: "<PropertyItem label=\"a\" value={x ? translate('Up') : translate('Down')} />",
      },
    ],
    invalid: [
      {
        filename,
        code: '<PropertyItem label="a" value={formatDateTime(row.created)} />',
        errors: [prefer('propVal.date(x, { precision: "datetime" })')],
      },
      {
        filename,
        code: '<PropertyList.Item label="a" value={row.end ? formatDate(row.end) : null} />',
        errors: [prefer('propVal.date(x)')],
      },
      {
        filename,
        code: '<PropertyItem label="a" value={row.total && defaultCurrency(row.total)} />',
        errors: [prefer('propVal.currency(x)')],
      },
      {
        filename,
        code: '<PropertyItem label="a" value={formatCount(row.total)} />',
        errors: [prefer('propVal.count(x)')],
      },
      {
        filename,
        code: "<PropertyItem label=\"a\" value={row.shared ? translate('Yes') : translate('No')} />",
        errors: [prefer('propVal.boolean(x)')],
      },
      {
        filename,
        code: "<PropertyItem label=\"a\" value={row.on ? translate('Enabled') : translate('Disabled')} />",
        errors: [prefer('propVal.boolean(x, { wording: "enabled" })')],
      },
      {
        filename,
        code: '<PropertyItem label="a" value={<BooleanField value={row.on} />} />',
        errors: [prefer('propVal.boolean(x, { display: "badge" })')],
      },
      {
        filename,
        code: '<PropertyItem label="a" value={row.tags?.join(\', \')} />',
        errors: [prefer('propVal.list(x)')],
      },
      {
        filename,
        code: '<PropertyItem label="a" value={formatMediumDateTime(row.sent)} />',
        errors: [prefer('propVal.date(x, { precision: "long" })')],
      },
      {
        filename,
        code: '<PropertyItem label="a" value={renderFieldOrDash(row.name)} />',
        errors: [{ messageId: 'dash' }],
      },
    ],
  });
});
