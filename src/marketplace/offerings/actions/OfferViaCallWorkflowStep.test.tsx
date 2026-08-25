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
    // Provisioned by the allocation decision's own flag, so it is not a choice
    // that can be made here.
    expect(screen.queryByText('Award response')).toBeNull();
  });

  // Matches how the call configuration screens gate dependents: the panel
  // review consolidates expert reviews, so it cannot be enabled alone — but
  // nor is an expert review silently added on the operator's behalf.
  it('blocks a step until the step it depends on is enabled', async () => {
    const user = userEvent.setup();
    renderField();

    expect(checkbox('Panel review').disabled).toBe(true);

    await user.click(checkbox('Expert review'));

    expect(checkbox('Panel review').disabled).toBe(false);
    expect(checkbox('Panel review').checked).toBe(false);
  });

  it('drops the steps that needed a step being disabled', async () => {
    const user = userEvent.setup();
    renderField();

    await user.click(checkbox('Expert review'));
    await user.click(checkbox('Panel review'));
    await user.click(checkbox('Expert review'));

    expect(checkbox('Expert review').checked).toBe(false);
    expect(checkbox('Panel review').checked).toBe(false);
    expect(checkbox('Panel review').disabled).toBe(true);
  });
});
