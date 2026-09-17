import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { WorkflowStepCreateButton } from './WorkflowStepCreateButton';

// What handlers.seed_workflow_steps creates for every new call: the whole
// catalogue except award_response, which the Allocation decision step
// provisions through its own flag.
const SEEDED = [
  { uuid: '1', step: 'administrative_check', is_enabled: true },
  { uuid: '2', step: 'technical_assessment', is_enabled: false },
  { uuid: '3', step: 'expert_review', is_enabled: false },
  { uuid: '4', step: 'panel_review', is_enabled: false },
  { uuid: '5', step: 'allocation_decision', is_enabled: true },
] as any[];

const renderButton = (configuredSteps: any[]) =>
  renderWithProviders(
    <WorkflowStepCreateButton
      call={{ uuid: 'call-uuid' } as any}
      configuredSteps={configuredSteps}
      refetch={vi.fn()}
    />,
  );

describe('WorkflowStepCreateButton', () => {
  it('is disabled on a freshly seeded call', async () => {
    renderButton(SEEDED);

    // Every addable step already has a row, so opening the dialog could only
    // show an empty step picker.
    expect(await screen.findByRole('button', { name: /Add/i })).toBeDisabled();
  });

  it('stays disabled when award_response has also been provisioned', async () => {
    renderButton([
      ...SEEDED,
      { uuid: '6', step: 'award_response', is_enabled: true },
    ] as any[]);

    expect(await screen.findByRole('button', { name: /Add/i })).toBeDisabled();
  });

  it('is enabled again once a step has been removed', async () => {
    renderButton(SEEDED.filter((s) => s.step !== 'technical_assessment'));

    expect(
      await screen.findByRole('button', { name: /Add/i }),
    ).not.toBeDisabled();
  });
});
