import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, Form } from 'react-final-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { validateWindow } from '../utils';

import { MaintenanceWindowPicker } from './MaintenanceWindowPicker';

// Drives the real calendar: every bug this file guards against lives in how
// the picker wires up to the form, which a stub would define away.
const Harness = () => (
  <Form onSubmit={() => undefined}>
    {({ handleSubmit, invalid }) => (
      <form onSubmit={handleSubmit}>
        <Field
          name="scheduled_window"
          component={MaintenanceWindowPicker}
          validate={(value) => validateWindow(value, {})}
        />
        <button type="submit" disabled={invalid}>
          Submit
        </button>
      </form>
    )}
  </Form>
);

const pickerTrigger = () =>
  screen.getByRole('button', { name: 'Pick a start and end date/time...' });

// Day buttons are labelled like "Wednesday, September 2nd, 2026".
const day = (label: string) =>
  screen.getByRole('button', { name: new RegExp(label) });

// Needs a frozen clock: picking *today* in the afternoon only makes a valid
// window because the start is floored at the next slot after now. The rest
// (chips, Custom…, validation on close) is in the component's stories.
describe('MaintenanceWindowPicker', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 2, 15, 30));
  });
  afterEach(() => vi.useRealTimers());

  it('enables submit after picking today and tomorrow in the afternoon', async () => {
    render(<Harness />);
    await userEvent.click(pickerTrigger());

    await userEvent.click(day('September 2nd, 2026'));
    await userEvent.click(day('September 3rd, 2026'));

    expect(screen.getByText('Submit')).toBeEnabled();
  });
});
