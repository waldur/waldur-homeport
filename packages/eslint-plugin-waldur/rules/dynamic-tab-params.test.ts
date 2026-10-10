import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import dynamicTabParams from './dynamic-tab-params.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  },
});

describe('dynamic-tab-params', () => {
  ruleTester.run('dynamic-tab-params', dynamicTabParams as any, {
    valid: [
      {
        code: "const r = { name: 'a', url: 'a/?tab', params: { tab: { dynamic: true } } };",
      },
      {
        code: "const r = { url: 'a/?tab&q', params: { tab: { dynamic: true }, q: { dynamic: true } } };",
      },
      // Params that are not tabs or search are left alone.
      { code: "const r = { name: 'a', url: 'a/?page&sort' };" },
      { code: "const r = { name: 'a', url: ':uuid/' };" },
      // Not a route.
      { code: "const r = { path: '?tab' };" },
      // A param that only contains the word.
      { code: "const r = { url: 'a/?stabilize' };" },
    ],
    invalid: [
      {
        code: "const r = { name: 'a', url: 'a/?tab' };",
        errors: [{ messageId: 'notDynamic' }],
        output:
          "const r = { name: 'a', url: 'a/?tab',\nparams: { tab: { dynamic: true } } };",
      },
      {
        code: "const r = { name: 'a', url: 'a/?tab&q', params: { tab: { dynamic: true } } };",
        errors: [{ messageId: 'notDynamic' }],
        output:
          "const r = { name: 'a', url: 'a/?tab&q', params: {\nq: { dynamic: true }, tab: { dynamic: true } } };",
      },
      {
        code: "const r = { url: 'a/?tab&section', params: { section: { dynamic: true } } };",
        errors: [{ messageId: 'notDynamic' }],
        output:
          "const r = { url: 'a/?tab&section', params: {\ntab: { dynamic: true }, section: { dynamic: true } } };",
      },
      {
        code: "const r = { url: 'a/?team_tab&customerTab', params: { team_tab: { squash: true } } };",
        errors: [{ messageId: 'notDynamic' }],
        output:
          "const r = { url: 'a/?team_tab&customerTab', params: {\ncustomerTab: { dynamic: true }, team_tab: { dynamic: true, squash: true } } };",
      },
      {
        code: "const r = { url: 'a/?tab', params: { tab: { dynamic: false } } };",
        errors: [{ messageId: 'notDynamic' }],
        output:
          "const r = { url: 'a/?tab', params: { tab: { dynamic: true } } };",
      },
    ],
  });
});
