import { render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useStepStatuses, UseStepStatusesOptions } from './useStepStatuses';

const STEPS = [
  { id: 'general', label: 'General', required: true, fields: ['project'] },
  { id: 'plan', label: 'Plan', required: true, fields: ['plan'] },
  {
    id: 'options',
    label: 'Options',
    fields: ['attributes.size', 'attributes.name'],
  },
];

const statuses = (options: Partial<UseStepStatusesOptions>) =>
  renderHook(() => useStepStatuses({ steps: STEPS, ...options })).result
    .current;

describe('useStepStatuses', () => {
  it('reports required, optional and complete steps', () => {
    const result = statuses({ completedSteps: [true, false, false] });
    expect(result.map((step) => step.status)).toEqual([
      'complete',
      'required',
      undefined,
    ]);
    expect(result.map((step) => step.id)).toEqual([
      'general',
      'plan',
      'options',
    ]);
  });

  it('puts locked before anything else', () => {
    const result = statuses({
      disabledSteps: [false, true, false],
      completedSteps: [false, true, false],
      criticalErrors: { plan: 'Gone' },
    });
    expect(result[1].status).toBe('locked');
  });

  it('reports a critical error over a warning', () => {
    const result = statuses({
      errors: { plan: 'Too large' },
      criticalErrors: { plan: 'Plan is archived' },
    });
    expect(result[1].status).toBe('error');
    render(<>{result[1].message}</>);
    expect(screen.getByText('Plan is archived')).toBeInTheDocument();
  });

  it('reports a nested field error against its step', () => {
    const result = statuses({ errors: { attributes: { size: ['Too big'] } } });
    expect(result[2].status).toBe('warning');
  });

  it('leaves "required" errors out unless asked', () => {
    expect(
      statuses({ errors: { plan: 'This field is required.' } })[1],
    ).toEqual(expect.objectContaining({ status: 'required' }));
    expect(
      statuses({
        errors: { plan: 'This field is required.' },
        showRequiredErrors: true,
      })[1].status,
    ).toBe('warning');
  });
});
