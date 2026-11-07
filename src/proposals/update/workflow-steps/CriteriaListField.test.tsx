import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { CriteriaListField } from './CriteriaListField';

const render = (
  criteria: { name: string; order: number; weight?: number }[],
  locked = false,
) => {
  const onSubmit = vi.fn();
  renderWithProviders(
    <Form
      onSubmit={onSubmit}
      mutators={{ ...arrayMutators }}
      initialValues={{ criteria }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <CriteriaListField name="criteria" locked={locked} />
          <button type="submit">Save</button>
        </form>
      )}
    />,
  );
  return onSubmit;
};

describe('CriteriaListField', () => {
  it('gives each criterion a weight, and shows no shares while they are equal', () => {
    render([
      { name: 'Excellence', order: 0, weight: 1 },
      { name: 'Impact', order: 1, weight: 1 },
    ]);

    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
    expect(screen.queryByText('Share')).toBeNull();
  });

  it("shows each criterion's share once the weights differ", async () => {
    render([
      { name: 'Excellence', order: 0, weight: 1 },
      { name: 'Impact', order: 1, weight: 1 },
    ]);
    const user = userEvent.setup();

    const [excellence] = screen.getAllByRole('spinbutton');
    await user.clear(excellence);
    await user.type(excellence, '3');

    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('adds a criterion that weighs 1', async () => {
    const onSubmit = render([]);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Add criteria' }));
    await user.type(
      screen.getByPlaceholderText('Criteria name (e.g., Efficiency)'),
      'Excellence',
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit.mock.calls[0][0].criteria).toEqual([
      { name: 'Excellence', order: 0, weight: 1 },
    ]);
  });

  it('shows scored criteria read-only, and says why', () => {
    render(
      [
        { name: 'Excellence', order: 0, weight: 3 },
        { name: 'Impact', order: 1, weight: 1 },
      ],
      true,
    );

    expect(screen.queryByRole('spinbutton')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add criteria' })).toBeNull();
    expect(screen.getByText('Excellence (75%)')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Reviewers have scored these criteria: they can no longer be changed.',
      ),
    ).toBeInTheDocument();
  });
});
