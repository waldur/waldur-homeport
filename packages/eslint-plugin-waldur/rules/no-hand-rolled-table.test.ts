import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import noHandRolledTable from './no-hand-rolled-table.js';

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

const filename = '/repo/src/customer/Example.tsx';

const oneTable = '<table><tbody /></table>';
const report = { messageId: 'noRawTable' };

describe('no-hand-rolled-table', () => {
  ruleTester.run('no-hand-rolled-table', noHandRolledTable as any, {
    valid: [
      { filename, code: '<Table rows={rows} />' },
      // The shared table implementation is allowed raw markup.
      { filename: '/repo/src/table/TableView.tsx', code: oneTable },
    ],
    invalid: [
      { filename, code: oneTable, errors: [report] },
      { filename, code: '<><table /><table /></>', errors: [report, report] },
    ],
  });
});
