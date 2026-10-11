import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import noBootstrapProgress from './no-bootstrap-progress.js';

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

describe('no-bootstrap-progress', () => {
  ruleTester.run('no-bootstrap-progress', noBootstrapProgress as any, {
    valid: [
      {
        code: "import { Progress } from 'waldur-ui'; const A = () => <Progress value={1} />;",
      },
      { code: "import { Card } from 'react-bootstrap';" },
      // Lookalike class names that are not the Bootstrap classes.
      { code: 'const A = () => <div className="call-in-progress-banner" />;' },
      { code: 'const A = () => <span className="aui-ask-user-progress" />;' },
      { code: 'const A = () => <div className="progress-steps-view" />;' },
    ],
    invalid: [
      {
        code: "import { ProgressBar } from 'react-bootstrap';",
        errors: [{ messageId: 'noProgressImport' }],
      },
      {
        code: "import { Card, ProgressBar } from 'react-bootstrap';",
        errors: [{ messageId: 'noProgressImport' }],
      },
      {
        code: "import ProgressBar from 'react-bootstrap/ProgressBar';",
        errors: [{ messageId: 'noProgressImport' }],
      },
      {
        code: 'const A = () => <div className="progress h-6px"><div className="progress-bar bg-primary" /></div>;',
        errors: [
          { messageId: 'noProgressClass' },
          { messageId: 'noProgressClass' },
        ],
      },
      {
        code: 'const A = () => <div className="progress-bar-striped" />;',
        errors: [{ messageId: 'noProgressClass' }],
      },
    ],
  });
});
