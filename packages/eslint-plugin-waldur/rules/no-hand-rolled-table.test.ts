import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import { REPO_ROOT } from '../lib/baseline.js';

import noHandRolledTable from './no-hand-rolled-table.js';

// A fixture baseline, so the tests don't depend on the real one.
process.env.WALDUR_HAND_ROLLED_TABLE_BASELINE_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '__fixtures__/hand-rolled-table.baseline.json',
);

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

// Not in the fixture baseline.
const unlisted = path.join(REPO_ROOT, 'src/__fixture__/Unlisted.tsx');
// Listed in the fixture baseline with one table.
const listed = path.join(REPO_ROOT, 'src/__fixture__/Listed.tsx');

const oneTable = '<table><tbody /></table>';
const twoTables = '<><table /><table /></>';

// RuleTester names the rule rule-to-test/.
const RULE = 'rule-to-test/no-hand-rolled-table';
const report = { messageId: 'noRawTable' };

describe('no-hand-rolled-table', () => {
  ruleTester.run('no-hand-rolled-table', noHandRolledTable as any, {
    valid: [
      { filename: unlisted, code: '<Table rows={rows} />' },
      // Up to the listed count passes.
      { filename: listed, code: oneTable },
      {
        filename: path.join(REPO_ROOT, 'src/table/TableView.tsx'),
        code: oneTable,
      },
      // A disabled table is reported (ESLint suppresses it, so the directive
      // is in use) but not counted, in every directive form: the listed
      // file's other table stays within its baseline of one.
      {
        filename: listed,
        code: `<>
  {/* eslint-disable-next-line ${RULE} -- why */}
  <table />
  <table />
</>`,
      },
      {
        filename: listed,
        code: `<>
  <table /> {/* eslint-disable-line ${RULE} -- why */}
  <table />
</>`,
      },
      {
        filename: listed,
        code: `/* eslint-disable ${RULE} -- why */
const A = () => <table />;
/* eslint-enable ${RULE} */
const B = () => <table />;`,
      },
    ],
    invalid: [
      { filename: unlisted, code: oneTable, errors: [report] },
      // One more than listed reports every table in the file.
      { filename: listed, code: twoTables, errors: [report, report] },
      // Fewer than listed: the baseline is stale and must shrink.
      {
        filename: listed,
        code: '<Table rows={rows} />',
        errors: [{ messageId: 'stale', data: { listed: '1', found: '0' } }],
      },
      // A directive for another rule that mentions this one in its reason
      // exempts nothing: the table counts, one over the baseline.
      {
        filename: listed,
        code: `<>
  {/* eslint-disable-next-line no-console -- unlike no-hand-rolled-table */}
  <table />
  <table />
</>`,
        errors: [report, report],
      },
      // After an eslint-enable the rule counts again.
      {
        filename: listed,
        code: `/* eslint-disable ${RULE} */
/* eslint-enable ${RULE} */
const A = () => <table />;
const B = () => <table />;`,
        errors: [report, report],
      },
    ],
  });
});
