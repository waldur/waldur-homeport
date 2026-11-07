import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { WorkflowStepCreateButton } from './WorkflowStepCreateButton';

const renderButton = (props = {}) =>
  renderWithProviders(
    <WorkflowStepCreateButton
      call={{ uuid: 'call-uuid' } as any}
      refetch={vi.fn()}
      {...props}
    />,
  );

describe('WorkflowStepCreateButton', () => {
  // A kind may appear any number of times, so a call whose workflow already
  // has a step of every kind can still take another.
  it('is enabled however many steps the call already has', async () => {
    renderButton();

    expect(
      await screen.findByRole('button', { name: /Add/i }),
    ).not.toBeDisabled();
  });

  it('is disabled while the call cannot be changed', async () => {
    renderButton({ disabled: true, tooltip: 'The call is archived.' });

    expect(await screen.findByRole('button', { name: /Add/i })).toBeDisabled();
  });
});
