import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import noOrphanFormLabel from './no-orphan-form-label.js';

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

describe('no-orphan-form-label', () => {
  ruleTester.run('no-orphan-form-label', noOrphanFormLabel as any, {
    valid: [
      {
        code: 'const A = () => <FormField><FormLabel>Name</FormLabel><Input /></FormField>;',
      },
      {
        code: 'const A = () => <FieldScope><FormLabel>Name</FormLabel></FieldScope>;',
      },
      {
        code: "const A = () => <FormGroup label='x'><FormLabel>Inner</FormLabel></FormGroup>;",
      },
      // Built in one place, placed in another, in the same component.
      {
        code: 'const A = () => { const label = <FormLabel>Name</FormLabel>; return <FormField>{label}<Input /></FormField>; };',
      },
      // Inside a callback of a component that renders the field.
      {
        code: 'const A = () => <FormField>{items.map(() => <FormLabel>x</FormLabel>)}</FormField>;',
      },
      // An explicit target, or props that may carry one.
      { code: "const A = () => <FormLabel htmlFor='x'>Name</FormLabel>;" },
      { code: 'const A = (props) => <FormLabel {...props} />;' },
      // Not the FormLabel component.
      { code: 'const A = () => <FormLegend>Name</FormLegend>;' },
      { code: 'const A = () => <FormHeading>Name</FormHeading>;' },
    ],
    invalid: [
      {
        code: 'const A = () => <div><FormLabel>Name</FormLabel><p>value</p></div>;',
        errors: [{ messageId: 'orphanFormLabel' }],
      },
      {
        code: 'function A() { return <><FormLabel>Group by:</FormLabel><SegmentedControl /></>; }',
        errors: [{ messageId: 'orphanFormLabel' }],
      },
      {
        code: 'const A = () => <FormLabel>Name</FormLabel>;',
        errors: [{ messageId: 'orphanFormLabel' }],
      },
      // A field in another component does not count.
      {
        code: 'const B = () => <FormField />; const A = () => <FormLabel>Name</FormLabel>;',
        errors: [{ messageId: 'orphanFormLabel' }],
      },
    ],
  });
});
