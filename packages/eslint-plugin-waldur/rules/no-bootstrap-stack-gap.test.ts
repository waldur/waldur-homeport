import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import noBootstrapStackGap from './no-bootstrap-stack-gap.js';

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

const IMPORT = "import { Stack } from 'react-bootstrap';\n";

describe('no-bootstrap-stack-gap', () => {
  ruleTester.run('no-bootstrap-stack-gap', noBootstrapStackGap as any, {
    valid: [
      {
        code:
          IMPORT +
          'const A = () => <Stack direction="horizontal" className="gap-3" />;',
      },
      // Another library's Stack, and a local component of the same name.
      {
        code: "import { Stack } from 'waldur-ui'; const A = () => <Stack gap={4} />;",
      },
      {
        code: 'const Stack = (p) => <div {...p} />; const A = () => <Stack gap={4} />;',
      },
    ],
    invalid: [
      {
        code:
          IMPORT + 'const A = () => <Stack direction="horizontal" gap={4} />;',
        output:
          IMPORT +
          'const A = () => <Stack direction="horizontal" className="gap-3" />;',
        errors: [{ messageId: 'noStackGap' }],
      },
      {
        // Bootstrap's 32.5px step, which Tailwind did not generate at all.
        code:
          IMPORT +
          'const A = () => <Stack direction="horizontal" gap={10} className="flex-wrap" />;',
        output:
          IMPORT +
          'const A = () => <Stack direction="horizontal" className="gap-8 flex-wrap" />;',
        errors: [{ messageId: 'noStackGap' }],
      },
      {
        code:
          IMPORT +
          'const A = () => <Stack className="font-medium" gap={2} direction="horizontal" />;',
        output:
          IMPORT +
          'const A = () => <Stack className="gap-1.5 font-medium" direction="horizontal" />;',
        errors: [{ messageId: 'noStackGap' }],
      },
      {
        // The attribute keeps its quotes and text: JSX strings have no escapes.
        code:
          IMPORT +
          `const A = () => <Stack gap={2} className='after:content-["x"]' />;`,
        output:
          IMPORT +
          `const A = () => <Stack className='gap-1.5 after:content-["x"]' />;`,
        errors: [{ messageId: 'noStackGap' }],
      },
      {
        code: "import Stack from 'react-bootstrap/Stack';\nconst A = () => <Stack gap={3} />;",
        output:
          'import Stack from \'react-bootstrap/Stack\';\nconst A = () => <Stack className="gap-2.5" />;',
        errors: [{ messageId: 'noStackGap' }],
      },
      {
        code: "import { default as S } from 'react-bootstrap/esm/Stack';\nconst A = () => <S gap={3} />;",
        output:
          'import { default as S } from \'react-bootstrap/esm/Stack\';\nconst A = () => <S className="gap-2.5" />;',
        errors: [{ messageId: 'noStackGap' }],
      },
      {
        code: "import * as RB from 'react-bootstrap';\nconst A = () => <RB.Stack gap={4} />;",
        output:
          'import * as RB from \'react-bootstrap\';\nconst A = () => <RB.Stack className="gap-3" />;',
        errors: [{ messageId: 'noStackGap' }],
      },
      {
        // Reported, not fixed: which gap class wins depends on Tailwind's
        // ordering (gap-5 sorts after gap-1), and a variant or axis class
        // covers only part of the gap.
        code:
          IMPORT +
          'const A = () => <Stack direction="horizontal" gap={5} className="gap-1" />;',
        output: null,
        errors: [{ messageId: 'noStackGap' }],
      },
      {
        code:
          IMPORT + 'const A = () => <Stack gap={3} className="md:gap-5" />;',
        output: null,
        errors: [{ messageId: 'noStackGap' }],
      },
      {
        // Reported, not fixed: a spread may carry a className of its own.
        code: IMPORT + 'const A = (p) => <Stack {...p} gap={4} />;',
        output: null,
        errors: [{ messageId: 'noStackGap' }],
      },
      {
        // Reported, not fixed: the className is an expression.
        code:
          IMPORT +
          'const A = ({ on }) => <Stack gap={3} className={on ? "active" : undefined} />;',
        output: null,
        errors: [{ messageId: 'noStackGap' }],
      },
      {
        // Reported, not fixed: the gap is not a literal step.
        code: IMPORT + 'const A = ({ g }) => <Stack gap={g} />;',
        output: null,
        errors: [{ messageId: 'noStackGap' }],
      },
      {
        code: IMPORT + 'const A = () => <Stack gap />;',
        output: null,
        errors: [
          {
            message:
              "react-bootstrap's Stack renders its gap prop as a runtime gap-N class, which is Tailwind's step " +
              "(or nothing, when no source spells it), not Bootstrap's. Put the class in className instead.",
          },
        ],
      },
    ],
  });
});
