import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OfferingQoSForm } from './OfferingQoSForm';

const TRES_MINS_LABEL = 'Max TRES-minutes per job (MaxTRESMinsPerJob)';

const renderForm = (initialValues = {}) => {
  const onSubmit = vi.fn();
  render(
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <OfferingQoSForm />
          <button type="submit">Submit</button>
        </form>
      )}
    />,
  );
  return onSubmit;
};

describe('OfferingQoSForm', () => {
  afterEach(() => {
    cleanup();
  });

  it('submits a cleared TRES limit as blank so the PATCH resets it', async () => {
    const onSubmit = renderForm({
      name: 'standard',
      max_tres_mins_per_job: 'node=4320',
    });
    await userEvent.clear(screen.getByLabelText(TRES_MINS_LABEL));
    await userEvent.click(screen.getByText('Submit'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toHaveProperty(
      'max_tres_mins_per_job',
      '',
    );
  });

  it('accepts SLURM TRES strings', async () => {
    const onSubmit = renderForm({ name: 'standard' });
    await userEvent.type(
      screen.getByLabelText(TRES_MINS_LABEL),
      'node=4320,mem=64g,license/matlab@db=2,4=60',
    );
    await userEvent.click(screen.getByText('Submit'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it('rejects a malformed TRES string', async () => {
    const onSubmit = renderForm({ name: 'standard' });
    await userEvent.type(screen.getByLabelText(TRES_MINS_LABEL), 'node:8');
    await userEvent.click(screen.getByText('Submit'));

    expect(
      await screen.findByText(
        "Enter comma-separated TRES limits such as 'cpu=512,mem=64G,gres/gpu=8'.",
      ),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
