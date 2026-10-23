import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { DateField } from './DateField';
import { withFormGroup } from './withFormGroup';

// test/mocks/date.tsx swaps DateField for a plain input app-wide; this test
// is about the real one.
vi.unmock('@/form/DateField');
vi.unmock('waldur-form');
vi.unmock('./DateField');

const DateGroup = withFormGroup(DateField);

const required = (value: unknown) =>
  value ? undefined : 'This field is required.';

const renderGroup = () =>
  render(
    <Form
      onSubmit={() => undefined}
      initialValues={{ end_date: '2026-06-15' }}
      render={() => (
        <>
          <DateGroup name="end_date" label="End date" validate={required} />
          <button type="button">Elsewhere</button>
        </>
      )}
    />,
  );

describe('DateField in a FormGroup', () => {
  it('shows only the refusal, not the required error it causes', async () => {
    renderGroup();
    const input = screen.getByRole('textbox', { name: 'End date' });
    await userEvent.clear(input);
    await userEvent.type(input, '20261340');
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));

    expect(screen.getByText('Enter a date as YYYY-MM-DD.')).toBeInTheDocument();
    expect(screen.queryByText('This field is required.')).toBeNull();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows the required error once the entry is emptied', async () => {
    renderGroup();
    const input = screen.getByRole('textbox', { name: 'End date' });
    await userEvent.clear(input);
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));

    expect(screen.getByText('This field is required.')).toBeInTheDocument();
    expect(input).toHaveAccessibleDescription(/This field is required/);
  });
});

describe('DateField refusing an entry', () => {
  const renderOptional = (onSubmit: (values: any) => void) =>
    render(
      <Form
        onSubmit={onSubmit}
        initialValues={{ end_date: '2026-12-31' }}
        render={({ handleSubmit, invalid }) => (
          <form onSubmit={handleSubmit}>
            <DateGroup name="end_date" label="End date" />
            <button type="submit" disabled={invalid}>
              Save
            </button>
          </form>
        )}
      />,
    );

  it('does not submit the emptied value of an optional field', async () => {
    const onSubmit = vi.fn();
    renderOptional(onSubmit);
    const input = screen.getByRole('textbox', { name: 'End date' });
    await userEvent.clear(input);
    await userEvent.type(input, '20261340');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByText('Enter a date as YYYY-MM-DD.')).toBeInTheDocument();
  });

  it('submits again once the refused entry is emptied', async () => {
    const onSubmit = vi.fn();
    renderOptional(onSubmit);
    const input = screen.getByRole('textbox', { name: 'End date' });
    await userEvent.clear(input);
    await userEvent.type(input, '20261340');
    await userEvent.tab();
    await userEvent.clear(input);
    await userEvent.tab();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].end_date ?? null).toBeNull();
  });
});

describe('DateField unmounted while refusing an entry', () => {
  it('leaves the form submittable', async () => {
    const onSubmit = vi.fn();
    const Harness = () => {
      const [shown, setShown] = useState(true);
      return (
        <Form
          onSubmit={onSubmit}
          render={({ handleSubmit, invalid }) => (
            <form onSubmit={handleSubmit}>
              {shown && <DateGroup name="end_date" label="End date" />}
              <button type="button" onClick={() => setShown(false)}>
                Hide
              </button>
              <button type="submit" disabled={invalid}>
                Save
              </button>
            </form>
          )}
        />
      );
    };
    render(<Harness />);
    await userEvent.type(
      screen.getByRole('textbox', { name: 'End date' }),
      '20261340',
    );
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    // Hidden while refusing: its validator must not outlive it.
    await userEvent.click(screen.getByRole('button', { name: 'Hide' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
