import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import noNativeDateInput from './no-native-date-input.js';

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

const error = { messageId: 'nativeDateInput' };

describe('no-native-date-input', () => {
  ruleTester.run('no-native-date-input', noNativeDateInput as any, {
    valid: [
      // Other input types are fine.
      { code: `const A = () => <input type="text" />;` },
      { code: `const A = () => <Form.Control type="number" />;` },
      { code: `const A = () => <BaseButton type="submit" />;` },
      // The replacements themselves.
      { code: `const A = () => <DatePicker value={v} onChange={set} />;` },
      { code: `const A = () => <MonthPicker value={v} onChange={set} />;` },
      // A dynamic type can't be judged statically.
      { code: `const A = ({ t }) => <input type={t} />;` },
      // `type` as data rather than a JSX attribute (chart axes, option specs).
      { code: `const axis = { type: 'time' };` },
      { code: `const spec = { date_field: { type: 'date' } };` },
    ],
    invalid: [
      {
        code: `const A = () => <input type="date" />;`,
        errors: [error],
      },
      {
        code: `const A = () => <Form.Control type="month" value={v} />;`,
        errors: [error],
      },
      {
        code: `const A = () => <FormControl type="datetime-local" />;`,
        errors: [error],
      },
      {
        code: `const A = () => <input type="time" />;`,
        errors: [error],
      },
      {
        code: `const A = () => <input type="week" />;`,
        errors: [error],
      },
      // Expression containers, templates and case don't hide it.
      {
        code: `const A = () => <input type={'date'} />;`,
        errors: [error],
      },
      {
        code: 'const A = () => <input type={`month`} />;',
        errors: [error],
      },
      {
        code: `const A = () => <input type="Date" />;`,
        errors: [error],
      },
      // Either branch of a conditional.
      {
        code: `const A = ({ withTime }) => <input type={withTime ? 'datetime-local' : 'date'} />;`,
        errors: [error, error],
      },
    ],
  });
});
