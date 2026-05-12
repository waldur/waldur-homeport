import { render } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, it, expect, vi } from 'vitest';

import { QuestionItem } from './QuestionItem';

describe('QuestionItem', () => {
  it('initializes value on mount', () => {
    let capturedValues: any = {};
    const question = {
      variable: 'test_var',
      type: 'string',
      default: 'default_val',
      label: 'Test Label',
    };
    render(
      <Form
        onSubmit={vi.fn()}
        render={({ values }) => {
          capturedValues = values;
          return <QuestionItem question={question as any} />;
        }}
      />,
    );
    expect(capturedValues.test_var).toBe('default_val');
  });

  it('prefixes name with parentName', () => {
    let capturedValues: any = {};
    const question = {
      variable: 'test_var',
      type: 'string',
      default: 'default_val',
      label: 'Test Label',
    };
    render(
      <Form
        onSubmit={vi.fn()}
        render={({ values }) => {
          capturedValues = values;
          return (
            <QuestionItem question={question as any} parentName="answers" />
          );
        }}
      />,
    );
    expect(capturedValues.answers.test_var).toBe('default_val');
  });

  it('parses boolean default value', () => {
    let capturedValues: any = {};
    const question = {
      variable: 'test_bool',
      type: 'boolean',
      default: 'true',
      label: 'Test Bool',
    };
    render(
      <Form
        onSubmit={vi.fn()}
        render={({ values }) => {
          capturedValues = values;
          return <QuestionItem question={question as any} />;
        }}
      />,
    );
    expect(capturedValues.test_bool).toBe(true);
  });
});
