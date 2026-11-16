import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StepCard, StepLock } from './StepCard';

describe('StepCard', () => {
  it('locks its fields and actions but keeps the reason readable', () => {
    render(
      <StepCard
        id="step-plan"
        title="Plan"
        disabled
        disabledReason="Select a project first."
        actions={<button type="button">Action</button>}
      >
        <input aria-label="Name" />
      </StepCard>,
    );

    const card = screen.getByTestId('step-plan');
    expect(card).toHaveAttribute('data-state', 'locked');

    expect(screen.getByLabelText('Name')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Action' })).toBeDisabled();

    // The locked regions (fieldsets) are inert; the title and the reason sit
    // outside them, so they are still read out.
    const regions = screen.getAllByRole('group');
    regions.forEach((region) => expect(region).toHaveAttribute('inert'));
    expect(
      regions.some((region) => within(region).queryByLabelText('Name')),
    ).toBe(true);
    regions.forEach((region) => {
      expect(within(region).queryByText('Select a project first.')).toBeNull();
      expect(within(region).queryByText('Plan')).toBeNull();
    });
    expect(screen.getByText('Select a project first.')).toBeInTheDocument();
  });

  it('leaves an open step interactive', () => {
    render(
      <StepCard id="step-plan" title="Plan">
        <input aria-label="Name" />
      </StepCard>,
    );

    expect(screen.getByTestId('step-plan')).not.toHaveAttribute('data-state');
    expect(screen.getByLabelText('Name')).toBeEnabled();
    screen
      .getAllByRole('group')
      .forEach((region) => expect(region).not.toHaveAttribute('inert'));
  });
});

describe('StepLock', () => {
  it('shows the reason only while locked', () => {
    const { rerender } = render(
      <StepLock disabled disabledReason="Locked because.">
        <input aria-label="Name" />
      </StepLock>,
    );
    expect(screen.getByText('Locked because.')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeDisabled();

    rerender(
      <StepLock disabledReason="Locked because.">
        <input aria-label="Name" />
      </StepLock>,
    );
    expect(screen.queryByText('Locked because.')).toBeNull();
    expect(screen.getByLabelText('Name')).toBeEnabled();
  });
});
