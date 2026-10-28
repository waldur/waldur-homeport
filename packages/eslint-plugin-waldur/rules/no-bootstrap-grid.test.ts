import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import noBootstrapGrid from './no-bootstrap-grid.js';

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

describe('no-bootstrap-grid', () => {
  ruleTester.run('no-bootstrap-grid', noBootstrapGrid as any, {
    valid: [
      { code: "import { Card } from 'react-bootstrap';" },
      {
        code: 'const A = () => <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5" />;',
      },
      {
        code: "const A = () => <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-x-5')} />;",
      },
      // Tailwind's grid placement utilities share the prefixes.
      {
        code: 'const A = () => <div className="md:col-span-8 col-span-12 row-span-2 col-start-3 grid-cols-12" />;',
      },
      // Lookalikes that are not grid classes.
      {
        code: 'const A = () => <div className="flex-row table-row row-actions col-actions gap-4" />;',
      },
      // A class prop default that is Tailwind.
      {
        code: "const F = ({ labelClass = 'sm:w-3/12' }) => null;",
      },
      // Not a class attribute.
      { code: 'const A = () => <div role="row" data-kind="col" />;' },
    ],
    invalid: [
      {
        code: "import { Card, Col, Row } from 'react-bootstrap';",
        errors: [
          { messageId: 'noGridImport', data: { name: 'Col' } },
          { messageId: 'noGridImport', data: { name: 'Row' } },
        ],
      },
      {
        code: "import type { ColProps } from 'react-bootstrap';",
        errors: [{ messageId: 'noGridImport', data: { name: 'ColProps' } }],
      },
      {
        code: "import Row from 'react-bootstrap/Row';",
        errors: [{ messageId: 'noGridImport', data: { name: 'Row' } }],
      },
      ...[
        'row',
        'col',
        'col-xs-6',
        'col-md-6',
        'col-sm',
        'col-lg-auto',
        'offset-md-2',
        'row-cols-3',
        'g-0',
        'gx-5',
        'gy-md-4',
        'gs-0',
        'gy-8px',
      ].map((token) => ({
        code: `const A = () => <div className="mb-4 ${token}" />;`,
        errors: [{ messageId: 'noGridClass', data: { token } }],
      })),
      // Tailwind generates these too (grid-column), so the message says so.
      ...['col-6', 'col-auto', 'md:col-6', 'sm:col-auto'].map((token) => ({
        code: `const A = () => <div className="mb-4 ${token}" />;`,
        errors: [{ messageId: 'tailwindLookalike', data: { token } }],
      })),
      {
        code: "const A = () => <div className={cn('row', x && 'p-4')} />;",
        errors: [{ messageId: 'noGridClass', data: { token: 'row' } }],
      },
      {
        code: "const A = () => <Card bodyClassName={classNames('row', x && 'p-4')} />;",
        errors: [{ messageId: 'noGridClass', data: { token: 'row' } }],
      },
      {
        code: 'const A = () => <Field valueClass="offset-sm-1" />;',
        errors: [{ messageId: 'noGridClass', data: { token: 'offset-sm-1' } }],
      },
      {
        code: 'const A = () => <StaticField labelClass="col-sm-3" controlClass="col-sm-9" />;',
        errors: [
          { messageId: 'noGridClass', data: { token: 'col-sm-3' } },
          { messageId: 'noGridClass', data: { token: 'col-sm-9' } },
        ],
      },
      {
        code: "const F = ({ labelClass = 'col-sm-3 col-md-4' }) => null;",
        errors: [{ messageId: 'noGridClass', data: { token: 'col-sm-3' } }],
      },
      {
        code: 'const A = () => <div className={`flex ${x} col-md-4`} />;',
        errors: [{ messageId: 'noGridClass', data: { token: 'col-md-4' } }],
      },
    ],
  });
});
