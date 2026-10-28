import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import noBootstrapBreadcrumb from './no-bootstrap-breadcrumb.js';

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

describe('no-bootstrap-breadcrumb', () => {
  ruleTester.run('no-bootstrap-breadcrumb', noBootstrapBreadcrumb as any, {
    valid: [
      {
        code: "import { Breadcrumb } from 'waldur-ui'; const A = () => <Breadcrumb />;",
      },
      {
        code: "import { BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from 'waldur-ui';",
      },
      // Layout classes that are permitted
      { code: 'const A = () => <div className="breadcrumb-mobile" />;' },
    ],
    invalid: [
      {
        code: 'const A = () => <ol className="breadcrumb"><li className="breadcrumb-item">Test</li></ol>;',
        errors: [
          { messageId: 'noBreadcrumbClass' },
          { messageId: 'noBreadcrumbClass' },
        ],
      },
      {
        code: 'const A = () => <div className="breadcrumb-container" />;',
        errors: [{ messageId: 'noBreadcrumbClass' }],
      },
      {
        code: 'const A = () => <li className="breadcrumb-item-static" />;',
        errors: [{ messageId: 'noBreadcrumbClass' }],
      },
      {
        code: 'const A = () => <span className="breadcrumb-item-static-label" />;',
        errors: [{ messageId: 'noBreadcrumbClass' }],
      },
      {
        code: 'const A = () => <span className="breadcrumb-text truncate" />;',
        errors: [{ messageId: 'noBreadcrumbClass' }],
      },
      {
        code: 'const A = () => <span className="breadcrumb-back me-2" />;',
        errors: [{ messageId: 'noBreadcrumbClass' }],
      },
    ],
  });
});
