import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import rule from './no-tooltip-on-bare-icon.js';

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

const ui = "import { Tooltip } from 'waldur-ui';";

describe('no-tooltip-on-bare-icon', () => {
  ruleTester.run('no-tooltip-on-bare-icon', rule as any, {
    valid: [
      {
        code: `${ui} const A = () => <Tooltip label="x"><button><InfoIcon /></button></Tooltip>;`,
      },
      {
        code: `${ui} const A = () => <Tooltip label="x"><span>text</span></Tooltip>;`,
      },
      // Not the waldur-ui Tooltip.
      {
        code: 'import { Tooltip } from \'elsewhere\'; const A = () => <Tooltip label="x"><InfoIcon /></Tooltip>;',
      },
    ],
    invalid: [
      {
        code: `${ui} const A = () => <Tooltip label="x"><WarningIcon size={16} /></Tooltip>;`,
        errors: [{ messageId: 'bareIcon' }],
      },
      {
        code: `${ui} const A = () => (\n<Tooltip label="x">\n  <QuestionIcon />\n</Tooltip>);`,
        errors: [{ messageId: 'bareIcon' }],
      },
    ],
  });
});
