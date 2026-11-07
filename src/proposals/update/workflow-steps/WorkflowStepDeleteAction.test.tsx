import { describe, expect, it } from 'vitest';

import { inputReadersNotice } from './WorkflowStepDeleteAction';

const step = (uuid: string, name: string, input_steps: string[] = []) =>
  ({ uuid, name, input_steps }) as any;

describe('inputReadersNotice', () => {
  const review = step('review', 'Scientific review');

  it('names the steps that read the removed step', () => {
    const steps = [
      review,
      step('individual', 'Individual reports', ['review']),
      step('consolidated', 'Consolidated report', ['review', 'individual']),
      step('decision', 'Allocation decision'),
    ];
    expect(inputReadersNotice(review, steps)).toBe(
      'Individual reports and Consolidated report read this step; they will lose it as an input.',
    );
  });

  it('says it of a single reader', () => {
    const steps = [review, step('response', 'Response to reviews', ['review'])];
    expect(inputReadersNotice(review, steps)).toBe(
      'Response to reviews reads this step; it will lose it as an input.',
    );
  });

  it('says nothing when no step reads it', () => {
    expect(inputReadersNotice(review, [review, step('x', 'X')])).toBeNull();
  });
});
