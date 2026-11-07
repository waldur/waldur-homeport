import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { defaultSteps } from './offerViaCallForm';
import { WorkflowStepsField } from './OfferViaCallWorkflowStep';

const renderField = () =>
  renderWithProviders(
    <Form
      onSubmit={vi.fn()}
      initialValues={{ steps: defaultSteps() }}
      render={() => <WorkflowStepsField />}
    />,
  );

const checkbox = (label: string) =>
  screen.getByLabelText(label, { selector: 'input' }) as HTMLInputElement;

describe('WorkflowStepsField', () => {
  // The point of the default: a request that lands on one decision rather
  // than a review process nobody asked for.
  it('starts with the allocation decision as the only enabled step', () => {
    renderField();

    expect(checkbox('Allocation decision').checked).toBe(true);
    expect(checkbox('Allocation decision').disabled).toBe(true);
    expect(checkbox('Administrative check').checked).toBe(false);
    expect(checkbox('Expert review').checked).toBe(false);
    // Not seeded on a new call; added in call configuration instead.
    expect(screen.queryByText('Award response')).toBeNull();
  });

  // The backend no longer ties one step to another: any of them can be
  // switched on alone.
  it('lets any optional step be switched on by itself', async () => {
    const user = userEvent.setup();
    renderField();

    expect(checkbox('Panel review').disabled).toBe(false);
    await user.click(checkbox('Panel review'));

    expect(checkbox('Panel review').checked).toBe(true);
    expect(checkbox('Expert review').checked).toBe(false);
  });
});
