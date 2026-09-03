import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, Form } from 'react-final-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { validateWindow } from '../utils';

import { MaintenanceWindowPicker } from './MaintenanceWindowPicker';

vi.mock('@/form/useFlatpickrTheme', () => ({
  useFlatpickrTheme: () => undefined,
}));

// Drives the real react-flatpickr: every bug this file guards against lives in
// how the library wires up its inputs, which a stub would define away.
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

// Flatpickr flags its visible input as active for as long as the calendar is
// open; the calendar element itself stays in the DOM either way.
const pickerInput = () => screen.getByRole('textbox');

describe('MaintenanceWindowPicker', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 2, 15, 30));
  });
  afterEach(() => vi.useRealTimers());

  it('opens the calendar from the Custom… chip', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByText('Custom…'));

    expect(pickerInput()).toHaveClass('active');
  });

  it('enables submit after picking today and tomorrow in the afternoon', async () => {
    render(<Harness />);
    await userEvent.click(pickerInput());

    await userEvent.click(screen.getByLabelText('September 2, 2026'));
    await userEvent.click(screen.getByLabelText('September 3, 2026'));

    expect(screen.getByText('Submit')).toBeEnabled();
  });

  it('shows the validation error once the calendar is closed', async () => {
    render(<Harness />);
    await userEvent.click(pickerInput());
    await userEvent.click(screen.getByLabelText('September 10, 2026'));
    await userEvent.click(screen.getByLabelText('September 10, 2026'));
    expect(screen.queryByText('End must be after start.')).toBeNull();

    // user-event sets only `key`/`code`; Flatpickr's handler switches on the
    // legacy `keyCode`, so its Escape-to-close path needs a raw keydown.
    // eslint-disable-next-line testing-library/prefer-user-event, testing-library/no-node-access
    fireEvent.keyDown(document.activeElement, { key: 'Escape', keyCode: 27 });

    expect(screen.getByText('End must be after start.')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeDisabled();
  });
});
